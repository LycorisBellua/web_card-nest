import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ErrorMessages } from './error_messages/ErrorMessages';
import { Ranks } from 'src/generated/prisma/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { decodeAvatarBase64 } from './utils/user.validator';
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
} from './utils/user.utils';
import { UserEmailsService } from './user-emails.service';
import { AdminUpdateUserDto } from '../admin/dto/admin-update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userEmailsService: UserEmailsService,
  ) {}

  // CALLED FROM USER CONTROLLER
  async removeUser(userId: string) {
    const found = await this.userExistsOrThrow(userId);
    const result = await this.deleteUser(userId);
    const address = found.email ? found.email : found.email_unverified;
    if (address) {
      await this.userEmailsService.sendDeletionEmail(address);
    }
    return result;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    await this.userExistsOrThrow(userId);
    const data: Record<string, unknown> = {};
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
        const decoded = decodeAvatarBase64(dto.avatar);
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
    return updated;
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
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
    return await this.modifyPassword(userId, await createHash(newPassword));
  }

  async updateRank(userId: string, newRank: Ranks) {
    await this.userExistsOrThrow(userId);
    return await this.modifyRank(userId, newRank);
  }

  async getOwnProfile(userId: string) {
    const found = await this.findOwnProfile(userId);
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return encodeSingleAvatar(found);
  }

  async getUserById(rank: Ranks, userId: string, toFind: string) {
    const found = await this.findProfileById(toFind);
    if (!found || (rank === Ranks.USER && found.rank === Ranks.PENDING)) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return encodeSingleAvatar(found);
  }

  async getUserByUsername(rank: Ranks, userId: string, toFind: string) {
    const found = await this.findProfileByUsername(toFind);
    if (!found || (rank === Ranks.USER && found.rank === Ranks.PENDING)) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return encodeSingleAvatar(found);
  }

  async getAllSortByUsername(rank: Ranks) {
    const includePending = rank === Ranks.USER ? false : true;
    const users = await this.listAllByUsername(includePending);
    return encodeMultipleAvatars(users);
  }

  async getAllSortByDate(rank: Ranks) {
    const includePending = rank === Ranks.USER ? false : true;
    const users = await this.listAllByDate(includePending);
    return encodeMultipleAvatars(users);
  }

  getGuestProfile() {
    return { id: '', username: 'guest', avatar: null, rank: '' };
  }

  // CALLED FROM USER-TASKS SERVICE
  async unverifiedUserCleanup() {
    const time = getCurrentTime();
    const toDelete = await this.expiredUsersToDelete(time);
    const toModify = await this.expiredUsersToModify(time);
    await this.deleteExpiredUnverified(time);
    await this.modifyExpiredUnverified(time);
    for (const user of toDelete) {
      if (user.email_unverified) {
        await this.userEmailsService.sendExpiredDeletionEmail(
          user.email_unverified,
        );
      }
    }
    for (const user of toModify) {
      if (user.email && user.email_unverified) {
        await this.userEmailsService.sendExpiredModificationEmail(
          user.email,
          user.email_unverified,
        );
      }
    }
  }

  // CALLED FROM AUTH SERVICE
  async addUser(createUserDto: CreateUserDto) {
    if (await this.usernameIsTaken(createUserDto.username)) {
      throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
    }
    if (await this.emailAddressIsTaken(createUserDto.email_unverified)) {
      throw new ConflictException(ErrorMessages.EMAIL_USED);
    }
    createUserDto.password = await createHash(createUserDto.password);
    const token = getToken();
    const timeout = getVerificationTimeout();
    const created = await this.createUser(
      createUserDto,
      await createHash(token),
      timeout,
    );
    const found = await this.userExistsOrThrow(created.id);
    if (found.email_unverified && found.verifyToken) {
      await this.userEmailsService.sendVerificationEmail(
        created.id,
        found.email_unverified,
        token,
      );
    }
    return created;
  }

  async verifyEmail(userId: string, token: string) {
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

  async cancelVerification(userId: string, token: string) {
    const found = await this.userExists(userId);
    if (
      !found ||
      !found.verifyToken ||
      !(await compareHash(token, found.verifyToken))
    ) {
      return null;
    }
    const data: Record<string, unknown> = {};
    data.email_unverified = null;
    data.verifyToken = null;
    data.verifyTimeout = null;
    if (found.email) {
      return await this.modifyVerificationData(userId, data);
    }
    return await this.deleteUser(userId);
  }

  async resendVerificationEmail(userId: string) {
    const found = await this.userExistsOrThrow(userId);
    if (!found.email_unverified) {
      return { id: userId };
    }
    const data: Record<string, unknown> = {};
    const token = getToken();
    data.verifyToken = await createHash(token);
    data.verifyTimeout = getVerificationTimeout();
    const result = await this.modifyVerificationData(userId, data);
    const updated = await this.userExistsOrThrow(userId);
    if (updated.email_unverified && updated.verifyToken) {
      await this.userEmailsService.sendVerificationEmail(
        userId,
        updated.email_unverified,
        token,
      );
    }
    return result;
  }

  async generateRefreshToken(
    userId: string,
  ): Promise<{ token: string; timeout: Date }> {
    await this.userExistsOrThrow(userId);
    const token = getToken();
    const timeout = getRefreshTimeout();
    const result = await this.modifyRefreshToken(
      userId,
      await createHash(token),
      timeout,
    );
    if (
      !result.refreshToken ||
      !(await compareHash(token, result.refreshToken))
    ) {
      throw new InternalServerErrorException(ErrorMessages.REF_TOK_UPD_ERR);
    }
    return { token: token, timeout: timeout };
  }

  async removeRefreshToken(userId: string) {
    await this.userExistsOrThrow(userId);
    const result = await this.deleteRefreshToken(userId);
    if (result.refreshToken !== null) {
      throw new InternalServerErrorException(ErrorMessages.REF_TOK_DEL_ERR);
    }
  }

  //CALLED FROM ADMIN SERVICE
  async adminUpdateUser(dto: AdminUpdateUserDto) {
    const data: Record<string, unknown> = {};

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
        const decoded = decodeAvatarBase64(dto.avatar);
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

    return await this.modifyUserInfo(dto.targetId, data);
  }

  // DB ACTIONS (INTERNAL USE ONLY - ONLY CALLED AFTER VALIDATION)
  private async createUser(
    createUserDto: CreateUserDto,
    token: string,
    timeout: Date,
  ) {
    return await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email_unverified: createUserDto.email_unverified,
        password: createUserDto.password,
        verifyToken: token,
        verifyTimeout: timeout,
      },
      select: { id: true, username: true, date: true },
    });
  }

  private async deleteUser(userId: string) {
    return await this.prisma.user.delete({
      where: { id: userId },
      select: { id: true },
    });
  }

  private async modifyVerifyEmail(
    userId: string,
    address: string,
    rank: Ranks,
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: address,
        rank: rank,
        email_unverified: null,
        verifyTimeout: null,
        verifyToken: null,
      },
      select: { email: true },
    });
  }

  private async modifyVerificationData(
    userId: string,
    newData: Record<string, unknown>,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: newData,
      select: { id: true },
    });
  }

  private async deleteExpiredUnverified(time: Date) {
    await this.prisma.user.deleteMany({
      where: { verifyTimeout: { lt: time }, email: null },
    });
  }

  private async modifyExpiredUnverified(time: Date) {
    await this.prisma.user.updateMany({
      where: { verifyTimeout: { lt: time }, email: { not: null } },
      data: { email_unverified: null, verifyTimeout: null, verifyToken: null },
    });
  }

  private async modifyUserInfo(
    userId: string,
    newData: Record<string, unknown>,
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: newData,
      select: { desc: true, email_unverified: true, username: true },
    });
  }

  private async modifyPassword(userID: string, newPassword: string) {
    return await this.prisma.user.update({
      where: { id: userID },
      data: { password: newPassword },
      select: { id: true },
    });
  }

  private async modifyRank(userId: string, newRank: Ranks) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { rank: newRank },
      select: { rank: true },
    });
  }

  private async modifyRefreshToken(
    userId: string,
    newToken: string | null,
    timeout: Date,
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: newToken, refreshTimeout: timeout },
      select: { refreshToken: true },
    });
  }

  private async deleteRefreshToken(userId: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, refreshTimeout: null },
      select: { refreshToken: true },
    });
  }

  private async findOwnProfile(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        rank: true,
        email: true,
        email_unverified: true,
      },
    });
  }

  private async findProfileById(toFind: string) {
    return await this.prisma.user.findUnique({
      where: { id: toFind },
      select: { id: true, username: true, avatar: true, rank: true },
    });
  }

  private async findProfileByUsername(toFind: string) {
    return await this.prisma.user.findFirst({
      where: { username: { equals: toFind, mode: 'insensitive' } },
      select: { id: true, username: true, avatar: true, rank: true },
    });
  }

  private async listAllByUsername(incPending: boolean) {
    return await this.prisma.user.findMany({
      where: incPending ? {} : { rank: { not: Ranks.PENDING } },
      select: { id: true, username: true, avatar: true, rank: true },
      orderBy: { username: 'asc' },
    });
  }

  private async listAllByDate(incPending: boolean) {
    return await this.prisma.user.findMany({
      where: incPending ? {} : { rank: { not: Ranks.PENDING } },
      select: { id: true, username: true, avatar: true, rank: true },
      orderBy: { date: 'asc' },
    });
  }

  // USER LOOKUP (INTERNAL USE ONLY)
  async userExistsOrThrow(toFind: string) {
    const found = await this.prisma.user.findUnique({
      where: { id: toFind },
      select: {
        email: true,
        email_unverified: true,
        rank: true,
        password: true,
        username: true,
        verifyToken: true,
        verifyTimeout: true,
        refreshToken: true,
        refreshTimeout: true,
      },
    });
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return found;
  }

  async userExistsByEmail(toFind: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email: toFind }, { email_unverified: toFind }],
      },
      select: {
        id: true,
        email: true,
        email_unverified: true,
        rank: true,
        password: true,
        username: true,
        verifyToken: true,
        verifyTimeout: true,
        refreshToken: true,
        refreshTimeout: true,
      },
    });
  }

  private async userExists(toFind: string) {
    return await this.prisma.user.findUnique({
      where: { id: toFind },
      select: {
        email: true,
        email_unverified: true,
        rank: true,
        password: true,
        username: true,
        verifyToken: true,
        verifyTimeout: true,
        refreshToken: true,
        refreshTimeout: true,
      },
    });
  }

  private async usernameIsTaken(toFind: string) {
    const found = await this.prisma.user.findUnique({
      where: { username: toFind },
      select: { username: true },
    });
    return found !== null;
  }

  private async emailAddressIsTaken(toFind: string) {
    const found = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: toFind }, { email_unverified: toFind }],
      },
      select: { id: true, email: true, email_unverified: true },
    });
    return found !== null;
  }

  private async expiredUsersToDelete(time: Date) {
    return await this.prisma.user.findMany({
      where: { verifyTimeout: { lt: time }, email: null },
    });
  }

  private async expiredUsersToModify(time: Date) {
    return await this.prisma.user.findMany({
      where: { verifyTimeout: { lt: time }, email: { not: null } },
    });
  }
}
