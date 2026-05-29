import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ErrorMessages } from './error_messages/ErrorMessages';
import { Ranks } from 'src/generated/prisma/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  compareHash,
  createHash,
  getCurrentTime,
  getVerificationTimeout,
  getToken,
  newPasswordContainsUsername,
  newPasswordContainsEmail,
  getRefreshTimeout,
  encodeSingleAvatar,
  encodeMultipleAvatars,
  decodeAvatar,
} from './utils/user.utils';
import { UserEmailsService } from './user-emails.service';
import { AdminUpdateUserDto } from '../admin/dto/admin-update-user.dto';
import { UpdateRankDto } from '../admin/dto/update-rank.dto';
import {
  EmailVerData,
  ExpiredToDelete,
  expiredToDeleteSelect,
  ExpiredToModify,
  expiredToModifySelect,
  noPendingUsers,
  OwnProfile,
  OwnProfileRaw,
  ownProfileSelect,
  RefreshData,
  refreshDataSelect,
  UpdateProfileData,
  UserProfile,
  UserProfileRaw,
  userProfileSelect,
  userVerificationSelect,
  VerificationData,
} from './types/user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userEmailsService: UserEmailsService,
  ) {}

  // CALLED FROM USER CONTROLLER
  async removeUser(userId: string): Promise<UserProfile> {
    const found = await this.userExistsOrThrow(userId);
    const result = await this.deleteUser(userId);
    const address = found.email ? found.email : found.email_unverified;
    if (address) {
      await this.userEmailsService.sendDeletionEmail(address);
    }
    return encodeSingleAvatar(result);
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<OwnProfile> {
    await this.userExistsOrThrow(userId);
    const data: UpdateProfileData = {};
    const token = getToken();

    if (dto.username !== undefined) {
      if (await this.usernameIsTaken(dto.username)) {
        throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
      }
      data.username = dto.username;
    }

    if (dto.email_unverified !== undefined) {
      if (await this.emailAddressIsTaken(dto.email_unverified)) {
        throw new ConflictException(ErrorMessages.EMAIL_USED);
      }
      data.email_unverified = dto.email_unverified;
      data.verifyToken = await createHash(token);
      data.verifyTimeout = getVerificationTimeout();
    }

    if (dto.avatar !== undefined) {
      if (dto.avatar === '') {
        data.avatar = null;
      } else {
        const decoded = decodeAvatar(dto.avatar);
        if (decoded === null) {
          throw new BadRequestException(ErrorMessages.INVALID_AVATAR);
        }
        data.avatar = decoded;
      }
    }

    if (dto.desc !== undefined) {
      if (dto.desc === '') {
        data.desc = null;
      } else {
        data.desc = dto.desc;
      }
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(ErrorMessages.NO_DATA);
    }

    const updated = await this.modifyUserInfo(userId, data);
    if (updated.email_unverified) {
      const found = await this.userExistsOrThrow(userId);
      if (found.email_unverified && found.verifyToken) {
        await this.userEmailsService.sendVerificationEmail(
          userId,
          found.email_unverified,
          token,
        );
      }
    }
    return encodeSingleAvatar(updated);
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserProfile> {
    const user = await this.userExistsOrThrow(userId);
    const newPassword = updatePasswordDto.newPassword;
    const currentPassword = updatePasswordDto.oldPassword;
    const email = user.email === null ? user.email_unverified : user.email;
    if (newPasswordContainsUsername(newPassword, user.username)) {
      throw new BadRequestException(ErrorMessages.USERNAME_IN_PASSWORD);
    }
    if (newPasswordContainsEmail(newPassword, email)) {
      throw new BadRequestException(ErrorMessages.EMAIL_IN_PASSWORD);
    }
    if (!(await compareHash(currentPassword, user.password))) {
      throw new BadRequestException(ErrorMessages.CURRENT_PASS_INCORRECT);
    }
    const updated = await this.modifyPassword(
      userId,
      await createHash(newPassword),
    );
    return encodeSingleAvatar(updated);
  }

  async getOwnProfile(userId: string): Promise<OwnProfile> {
    const found = await this.findOwnProfile(userId);
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return encodeSingleAvatar(found);
  }

  async getUserById(rank: Ranks, toFind: string): Promise<UserProfile> {
    const found = await this.findProfileById(toFind);
    if (!found || (rank === Ranks.USER && found.rank === Ranks.PENDING)) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return encodeSingleAvatar(found);
  }

  async getUserByUsername(rank: Ranks, toFind: string): Promise<UserProfile> {
    const found = await this.findProfileByUsername(toFind);
    if (!found || (rank === Ranks.USER && found.rank === Ranks.PENDING)) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return encodeSingleAvatar(found);
  }

  async getAllSortByUsername(rank: Ranks): Promise<UserProfile[]> {
    const includePending = rank === Ranks.USER ? false : true;
    const users = await this.listAllByUsername(includePending);
    return encodeMultipleAvatars(users);
  }

  async getAllSortByDate(rank: Ranks): Promise<UserProfile[]> {
    const includePending = rank === Ranks.USER ? false : true;
    const users = await this.listAllByDate(includePending);
    return encodeMultipleAvatars(users);
  }

  getGuestProfile() {
    return { id: '', username: 'guest', avatar: null, rank: '' };
  }

  // CALLED FROM USER-TASKS SERVICE
  async unverifiedUserCleanup(): Promise<void> {
    const time = getCurrentTime();
    const toDelete = await this.expiredUsersToDelete(time);
    const toModify = await this.expiredUsersToModify(time);
    await this.deleteExpiredUnverified(time);
    await this.modifyExpiredUnverified(time);
    if (toDelete) {
      for (const user of toDelete) {
        if (user.email_unverified) {
          await this.userEmailsService.sendExpiredDeletionEmail(
            user.email_unverified,
          );
        }
      }
    }
    if (toModify) {
      for (const user of toModify) {
        if (user.email && user.email_unverified) {
          await this.userEmailsService.sendExpiredModificationEmail(
            user.email,
            user.email_unverified,
          );
        }
      }
    }
  }

  // CALLED FROM AUTH SERVICE
  async addUser(newUser: CreateUserDto): Promise<OwnProfile> {
    await this.throwIfUsernameOrEmailIsTaken(
      newUser.username,
      newUser.email_unverified,
    );
    const token = getToken();
    const created = await this.createUser(
      newUser.username,
      newUser.email_unverified,
      await createHash(newUser.password),
      await createHash(token),
      getVerificationTimeout(),
    );
    await this.userEmailsService.sendVerificationEmail(
      created.id,
      newUser.email_unverified,
      token,
    );
    return encodeSingleAvatar(created);
  }

  async verifyEmail(userId: string, token: string): Promise<UserEmail | null> {
    const found = await this.userExists(userId);
    if (
      !found ||
      !found.verifyToken ||
      !(await compareHash(token, found.verifyToken)) ||
      !found.email_unverified ||
      !found.verifyTimeout ||
      found.verifyTimeout < new Date()
    ) {
      return null;
    }
    let newRank: Ranks;
    if (found.rank === Ranks.PENDING) {
      newRank = Ranks.USER;
    } else {
      newRank = found.rank;
    }
    const verified = await this.modifyVerifyEmail(
      userId,
      found.email_unverified,
      newRank,
    );
    if (!verified || !verified.email) {
      return null;
    }
    await this.userEmailsService.sendVerificationSuccess(verified.email);
    return verified;
  }

  async cancelVerification(
    userId: string,
    token: string,
  ): Promise<UserProfile> {
    const found = await this.userExists(userId);
    if (
      !found ||
      !found.verifyToken ||
      !(await compareHash(token, found.verifyToken))
    ) {
      throw new BadRequestException();
    }
    const data: EmailVerData = {
      email_unverified: null,
      verifyToken: null,
      verifyTimeout: null,
    };
    if (found.email) {
      const modified = await this.modifyVerificationData(userId, data);
      return encodeSingleAvatar(modified);
    }
    const deleted = await this.deleteUser(userId);
    return encodeSingleAvatar(deleted);
  }

  async resendVerificationEmail(userId: string): Promise<UserProfile> {
    const found = await this.userExistsOrThrow(userId);
    if (!found.email_unverified) {
      throw new NotFoundException('User has no unverified email address.');
    }
    const token = getToken();
    const data: EmailVerData = {
      verifyToken: await createHash(token),
      verifyTimeout: getVerificationTimeout(),
    };
    const result = await this.modifyVerificationData(userId, data);
    const updated = await this.userExistsOrThrow(userId);
    if (updated.email_unverified && updated.verifyToken) {
      await this.userEmailsService.sendVerificationEmail(
        userId,
        updated.email_unverified,
        token,
      );
    }
    return encodeSingleAvatar(result);
  }

  async generateRefreshToken(userId: string): Promise<RefreshData> {
    await this.userExistsOrThrow(userId);
    const token = getToken();
    const timeout = getRefreshTimeout();
    return await this.modifyRefreshToken(
      userId,
      await createHash(token),
      timeout,
    );
  }

  async removeRefreshToken(userId: string): Promise<RefreshData> {
    await this.userExistsOrThrow(userId);
    return await this.deleteRefreshToken(userId);
  }

  //CALLED FROM ADMIN SERVICE
  async adminUpdateUser(dto: AdminUpdateUserDto): Promise<UserProfile> {
    const data: UpdateProfileData = {};

    if (dto.username !== undefined) {
      if (await this.usernameIsTaken(dto.username)) {
        throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
      }
      data.username = dto.username;
    }

    if (dto.avatar !== undefined) {
      if (dto.avatar === '') {
        data.avatar = null;
      } else {
        const decoded = decodeAvatar(dto.avatar);
        if (decoded === null) {
          throw new BadRequestException(ErrorMessages.INVALID_AVATAR);
        }
        data.avatar = decoded;
      }
    }

    if (dto.desc !== undefined) {
      if (dto.desc === '') {
        data.desc = null;
      } else {
        data.desc = dto.desc;
      }
    }

    const updated = await this.adminModifyUserInfo(dto.targetId, data);
    return encodeSingleAvatar(updated);
  }

  async updateRank(dto: UpdateRankDto): Promise<UserProfile> {
    const found = await this.userExistsOrThrow(dto.targetId);
    if (found.rank === Ranks.PENDING) {
      throw new BadRequestException(ErrorMessages.PENDING_USER);
    }
    const modified = await this.modifyRank(dto);
    return encodeSingleAvatar(modified);
  }

  async updateSwapAdmins(
    currentAdmin: string,
    newAdmin: string,
  ): Promise<UserProfile> {
    await this.userExistsOrThrow(currentAdmin);
    const found = await this.userExistsOrThrow(newAdmin);
    if (found.rank === Ranks.PENDING) {
      throw new BadRequestException(ErrorMessages.PENDING_USER);
    }
    const modified = await this.modifyRankAdminSwap(currentAdmin, newAdmin);
    return encodeSingleAvatar(modified);
  }

  // DB ACTIONS (INTERNAL USE ONLY - ONLY CALLED AFTER VALIDATION)
  private async createUser(
    username: string,
    email_unverified: string,
    password: string,
    token: string,
    timeout: Date,
  ): Promise<OwnProfileRaw> {
    return await this.prisma.user.create({
      data: {
        username: username,
        email_unverified: email_unverified,
        password: password,
        verifyToken: token,
        verifyTimeout: timeout,
      },
      select: ownProfileSelect,
    });
  }

  private async deleteUser(id: string): Promise<UserProfileRaw> {
    return await this.prisma.user.delete({
      where: { id },
      select: userProfileSelect,
    });
  }

  private async modifyVerifyEmail(
    id: string,
    address: string,
    rank: Ranks,
  ): Promise<OwnProfileRaw> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        email: address,
        rank: rank,
        email_unverified: null,
        verifyTimeout: null,
        verifyToken: null,
      },
      select: ownProfileSelect,
    });
  }

  private async modifyVerificationData(
    id: string,
    newData: EmailVerData,
  ): Promise<UserProfileRaw> {
    return await this.prisma.user.update({
      where: { id },
      data: newData,
      select: userProfileSelect,
    });
  }

  private async deleteExpiredUnverified(time: Date): Promise<void> {
    await this.prisma.user.deleteMany({
      where: { verifyTimeout: { lt: time }, email: null },
    });
  }

  private async modifyExpiredUnverified(time: Date): Promise<void> {
    await this.prisma.user.updateMany({
      where: { verifyTimeout: { lt: time }, email: { not: null } },
      data: { email_unverified: null, verifyTimeout: null, verifyToken: null },
    });
  }

  private async modifyUserInfo(
    id: string,
    newData: Record<string, unknown>,
  ): Promise<OwnProfileRaw> {
    return await this.prisma.user.update({
      where: { id },
      data: newData,
      select: ownProfileSelect,
    });
  }

  private async adminModifyUserInfo(
    id: string,
    newData: Record<string, unknown>,
  ): Promise<UserProfileRaw> {
    return await this.prisma.user.update({
      where: { id },
      data: newData,
      select: userProfileSelect,
    });
  }

  private async modifyPassword(
    id: string,
    newPassword: string,
  ): Promise<UserProfileRaw> {
    return await this.prisma.user.update({
      where: { id },
      data: { password: newPassword },
      select: userProfileSelect,
    });
  }

  private async modifyRank(newData: UpdateRankDto): Promise<UserProfileRaw> {
    return await this.prisma.user.update({
      where: { id: newData.targetId },
      data: { rank: newData.rank },
      select: userProfileSelect,
    });
  }

  private async modifyRankAdminSwap(
    currentAdmin: string,
    newAdmin: string,
  ): Promise<UserProfileRaw> {
    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { id: newAdmin },
        data: { rank: Ranks.ADMIN },
        select: userProfileSelect,
      });
      await tx.user.update({
        where: { id: currentAdmin },
        data: { rank: Ranks.MODERATOR },
      });
      return result;
    });
  }

  private async modifyRefreshToken(
    userId: string,
    newToken: string | null,
    timeout: Date,
  ): Promise<RefreshData> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: newToken, refreshTimeout: timeout },
      select: refreshDataSelect,
    });
  }

  private async deleteRefreshToken(id: string): Promise<RefreshData> {
    return await this.prisma.user.update({
      where: { id },
      data: { refreshToken: null, refreshTimeout: null },
      select: refreshDataSelect,
    });
  }

  private async findOwnProfile(id: string): Promise<OwnProfileRaw | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: ownProfileSelect,
    });
  }

  private async findProfileById(id: string): Promise<UserProfileRaw | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: userProfileSelect,
    });
  }

  private async findProfileByUsername(
    toFind: string,
  ): Promise<UserProfileRaw | null> {
    return await this.prisma.user.findFirst({
      where: { username: { equals: toFind, mode: 'insensitive' } },
      select: userProfileSelect,
    });
  }

  private async listAllByUsername(
    incPending: boolean,
  ): Promise<UserProfileRaw[]> {
    return await this.prisma.user.findMany({
      where: incPending ? {} : noPendingUsers,
      select: userProfileSelect,
      orderBy: { username: 'asc' },
    });
  }

  private async listAllByDate(incPending: boolean): Promise<UserProfileRaw[]> {
    return await this.prisma.user.findMany({
      where: incPending ? {} : noPendingUsers,
      select: userProfileSelect,
      orderBy: { date: 'asc' },
    });
  }

  // USER LOOKUP (INTERNAL USE ONLY)
  async userExistsOrThrow(id: string): Promise<VerificationData> {
    const found = await this.prisma.user.findUnique({
      where: { id },
      select: userVerificationSelect,
    });
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return found;
  }

  async userExistsByEmail(toFind: string): Promise<VerificationData | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email: toFind }, { email_unverified: toFind }],
      },
      select: userVerificationSelect,
    });
  }

  private async userExists(id: string): Promise<VerificationData | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: userVerificationSelect,
    });
  }

  private async usernameIsTaken(username: string): Promise<boolean> {
    const found = await this.prisma.user.findUnique({
      where: { username },
      select: { username: true },
    });
    return found !== null;
  }

  private async emailAddressIsTaken(toFind: string): Promise<boolean> {
    const found = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: toFind }, { email_unverified: toFind }],
      },
      select: { id: true },
    });
    return found !== null;
  }

  private async throwIfUsernameOrEmailIsTaken(
    username: string,
    email: string,
  ): Promise<boolean> {
    const found = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }, { email_unverified: email }],
      },
      select: { username: true, email: true, email_unverified: true },
    });
    if (found) {
      if (found.username === username) {
        throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
      } else if (found.email === email || found.email_unverified === email) {
        throw new ConflictException(ErrorMessages.EMAIL_USED);
      }
    }
    return false;
  }

  private async expiredUsersToDelete(
    time: Date,
  ): Promise<ExpiredToDelete | null> {
    return await this.prisma.user.findMany({
      where: { verifyTimeout: { lt: time }, email: null },
      select: expiredToDeleteSelect,
    });
  }

  private async expiredUsersToModify(
    time: Date,
  ): Promise<ExpiredToModify | null> {
    return await this.prisma.user.findMany({
      where: { verifyTimeout: { lt: time }, email: { not: null } },
      select: expiredToModifySelect,
    });
  }
}
