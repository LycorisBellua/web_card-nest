import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ErrorMessages } from './error_messages/ErrorMessages';
import { Ranks } from 'src/generated/prisma/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { decodeAvatarBase64 } from './utils/user.validator';
import {
  comparePasswordHash,
  createPasswordHash,
  getCurrentTime,
  getVerificationTimeout,
  getToken,
  newPasswordContainsUsername,
  newPasswordContainsEmail,
  encodeSingleAvatar,
  encodeMultipleAvatars,
  createTokenHash,
  compareTokenHash,
} from './utils/user.utils';
import { UserEmailsService } from './user-emails.service';
import { AdminUpdateUserDto } from '../admin/dto/admin-update-user.dto';
import { UpdateRankDto } from '../admin/dto/update-rank.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
// import { WebsocketServer } from '../websocketGateway/websocket.gateway';

@Injectable()
export class UserService {
  constructor(
    public prisma: PrismaService,
    private readonly userEmailsService: UserEmailsService,
    private eventEmitter: EventEmitter2,
    // readonly WebsocketServer : WebsocketServer,
  ) {}
  


  // async findAcceptedUserService(originId: string) 
  // {
  //   return await this.prisma.friend.findMany({
  //     where: {
  //       status: 'ACCEPTED',
  //       OR: [{ requesterId: originId }, { addresseeId: originId }],
  //     },
  //   });
  // }  
  // async fetchFriendsListUserService(originId: string) {
    
  //   const RawData = await this.fetchFriendsUserService(originId);
  //   const FriendIdList = RawData.map(item => item.requesterId !== originId ? item.requesterId : item.addresseeId);
  //   const FriendsList = await Promise.all(FriendIdList.map(item => this.getUsernameById(item)));
  //   return {FriendsList};
  // }
  // async fetchFriendsUserService(originId: string) 
  //   {
  //   await this.userExistsOrThrow(originId);
  //   return await this.findAcceptedUserService(originId);
  //   }
  
  // async UpdateFriendFriendlist(userId: string, friendList: any[])
  // {
  //   let friendfriendList;
  //   for (const friend of friendList)
  //   {
  //     friendfriendList = await this.fetchFriendsListUserService(userId);
  //     this.WebsocketServer.emitFriendList({TargetUserId: friend.id, Friends: friendfriendList});
  //   }
  // }

  // CALLED FROM USER CONTROLLER
  async removeUser(userId: string) {
    const found = await this.userExistsOrThrow(userId);
    await this.eventEmitter.emit('RefreshFriendsFriendList', userId);
    const result = await this.deleteUser(userId); 
    await this.deleteUserFromFriendTable(userId);
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
      data.verifyToken = createTokenHash(token);
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
    await this.eventEmitter.emit('RefreshFriendsFriendList', userId);
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
    if (!(await comparePasswordHash(currentPassword, user.password))) {
      throw new BadRequestException(ErrorMessages.CURRENT_PASS_INCORRECT);
    }
    return await this.modifyPassword(
      userId,
      await createPasswordHash(newPassword),
    );
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

  async getUsernameById(toFind: string) {
    const found = await this.prisma.user.findUnique({
      where: { id: toFind },
      select: {
        username: true,
        id: true,
      },
    });
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return { ...found };
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
  async addUser(newUser: CreateUserDto) {
    await this.throwIfUsernameOrEmailIsTaken(
      newUser.username,
      newUser.email_unverified,
    );
    const token = getToken();
    const created = await this.createUser(
      newUser.username,
      newUser.email_unverified,
      await createPasswordHash(newUser.password),
      createTokenHash(token),
      getVerificationTimeout(),
    );
    await this.userEmailsService.sendVerificationEmail(
      created.id,
      newUser.email_unverified,
      token,
    );
    return created;
  }

  async verifyEmail(userId: string, token: string) {
    const found = await this.userExists(userId);
    if (
      !found ||
      !found.verifyToken ||
      !compareTokenHash(token, found.verifyToken) ||
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
      !compareTokenHash(token, found.verifyToken)
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
    data.verifyToken = createTokenHash(token);
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

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    timeout: Date,
  ) {
    await this.userExistsOrThrow(userId);
    return await this.modifyRefreshToken(
      userId,
      createTokenHash(refreshToken),
      timeout,
    );
  }

  async removeRefreshToken(userId: string) {
    await this.userExistsOrThrow(userId);
    return await this.deleteRefreshToken(userId);
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

  async updateRank(dto: UpdateRankDto) {
    const found = await this.userExistsOrThrow(dto.targetId);
    if (found.rank === Ranks.PENDING) {
      throw new BadRequestException(ErrorMessages.PENDING_USER);
    }
    return await this.modifyRank(dto);
  }

  async updateSwapAdmins(currentAdmin: string, newAdmin: string) {
    await this.userExistsOrThrow(currentAdmin);
    const found = await this.userExistsOrThrow(newAdmin);
    if (found.rank === Ranks.PENDING) {
      throw new BadRequestException(ErrorMessages.PENDING_USER);
    }
    return await this.modifyRankAdminSwap(currentAdmin, newAdmin);
  }

  // DB ACTIONS (INTERNAL USE ONLY - ONLY CALLED AFTER VALIDATION)
  private async createUser(
    username: string,
    email_unverified: string,
    password: string,
    token: string,
    timeout: Date,
  ) {
    return await this.prisma.user.create({
      data: {
        username: username,
        email_unverified: email_unverified,
        password: password,
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
  private async deleteUserFromFriendTable(userId: string) {
    return await this.prisma.friend.deleteMany({
      where: {  OR: [ {addresseeId: userId}, {requesterId: userId}, ]},
  
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
    return await this.prisma.user.update({
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
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: newData,
      select: {
        desc: true,
        email_unverified: true,
        username: true,
        avatar: true,
      },
    });
    return {
      ...updated,
      avatar: updated.avatar
        ? Buffer.from(updated.avatar).toString('base64')
        : null,
    };
  }

  private async modifyPassword(userID: string, newPassword: string) {
    return await this.prisma.user.update({
      where: { id: userID },
      data: { password: newPassword },
      select: { id: true, rank: true },
    });
  }

  private async modifyRank(newData: UpdateRankDto) {
    return await this.prisma.user.update({
      where: { id: newData.targetId },
      data: { rank: newData.rank },
      select: { id: true, rank: true },
    });
  }

  private async modifyRankAdminSwap(currentAdmin: string, newAdmin: string) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: newAdmin },
        data: { rank: Ranks.ADMIN },
      });
      await tx.user.update({
        where: { id: currentAdmin },
        data: { rank: Ranks.MODERATOR },
      });
      return { id: newAdmin, rank: Ranks.ADMIN };
    });
  }

  private async modifyRefreshToken(
    userId: string,
    newToken: string,
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
        date: true,
        desc: true,
        email: true,
        email_unverified: true,
      },
    });
  }

  private async findProfileById(toFind: string) {
    return await this.prisma.user.findUnique({
      where: { id: toFind },
      select: {
        id: true,
        username: true,
        avatar: true,
        rank: true,
        date: true,
        desc: true,
      },
    });
  }

  private async findProfileByUsername(toFind: string) {
    return await this.prisma.user.findFirst({
      where: { username: { equals: toFind, mode: 'insensitive' } },
      select: {
        id: true,
        username: true,
        avatar: true,
        rank: true,
        date: true,
        desc: true,
      },
    });
  }

  private async listAllByUsername(incPending: boolean) {
    return await this.prisma.user.findMany({
      where: incPending ? {} : { rank: { not: Ranks.PENDING } },
      select: {
        id: true,
        username: true,
        avatar: true,
        rank: true,
        date: true,
        desc: true,
      },
      orderBy: { username: 'asc' },
    });
  }

  private async listAllByDate(incPending: boolean) {
    return await this.prisma.user.findMany({
      where: incPending ? {} : { rank: { not: Ranks.PENDING } },
      select: {
        id: true,
        username: true,
        avatar: true,
        rank: true,
        date: true,
        desc: true,
      },
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
      },
    });
  }

  async userExistsByRefreshTokenHash(toFind: string) {
    return await this.prisma.user.findUnique({
      where: { refreshToken: toFind },
      select: { id: true, rank: true, refreshTimeout: true },
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

  private async throwIfUsernameOrEmailIsTaken(username: string, email: string) {
    const found = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
          { email_unverified: email },
        ],
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
