import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Ranks } from 'src/generated/prisma/enums';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdmErrMsg } from './errors/admin-error-messages';
import { UpdateRankDto } from './dto/update-rank.dto';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  banListOrder,
  BannedUser,
  banSelect,
  lobbyModeratedData,
} from './types/admin.types';
import {
  lobbyMessageSelect,
  LobbyMessageSingle,
} from '../chat/types/chat.types';
import { UserProfile } from '../user/types/user.types';
import {
  encodeMultipleAvatars,
  encodeSingleAvatar,
} from '../user/utils/user.utils';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async adminModifyUser(
    userId: string,
    rank: Ranks,
    dto: AdminUpdateUserDto,
  ): Promise<UserProfile> {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, dto.targetId, AdmErrMsg.OWN_PROFILE);
    const target = await this.userService.userExistsOrThrow(dto.targetId);
    this.modPermissionCheck(rank, target.rank);
    return this.userService.adminUpdateUser(dto);
  }

  async adminModifyRank(
    userId: string,
    rank: Ranks,
    dto: UpdateRankDto,
  ): Promise<UserProfile> {
    await this.jwtRankIsValid(userId, rank);
    if (dto.rank === Ranks.PENDING) {
      throw new BadRequestException(AdmErrMsg.NO_PENDING);
    }

    if (rank === Ranks.MODERATOR) {
      if (userId !== dto.targetId) {
        throw new UnauthorizedException(AdmErrMsg.ADMIN_OTHER);
      } else if (dto.rank !== Ranks.USER) {
        throw new UnauthorizedException(AdmErrMsg.ADMIN_PROMOTE);
      } else {
        return await this.userService.updateRank(dto);
      }
    }

    if (userId === dto.targetId) {
      return await this.userService.updateRank(dto);
    } else if (dto.rank !== Ranks.ADMIN) {
      return await this.userService.updateRank(dto);
    } else {
      return this.userService.updateSwapAdmins(userId, dto.targetId);
    }
  }

  async adminRemoveUser(
    adminId: string,
    adminRank: Ranks,
    targetId: string,
  ): Promise<UserProfile> {
    await this.jwtRankIsValid(adminId, adminRank);
    this.selfCheck(adminId, targetId, AdmErrMsg.OWN_PROFILE);
    return await this.userService.removeUser(targetId);
  }

  async lobbyChatBan(
    userId: string,
    rank: Ranks,
    targetId: string,
  ): Promise<UserProfile> {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, targetId, AdmErrMsg.LOBBY_SELF);
    const target = await this.userService.userExistsOrThrow(targetId);
    this.modPermissionCheck(rank, target.rank);
    try {
      const ban = await this.createLobbyBan(targetId);
      return this.convertBan(ban);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(AdmErrMsg.ALREADY_BAN);
      }
      throw err;
    }
  }

  async lobbyChatUnban(
    userId: string,
    rank: Ranks,
    targetId: string,
  ): Promise<UserProfile> {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, targetId, AdmErrMsg.LOBBY_SELF);
    const target = await this.userService.userExistsOrThrow(targetId);
    this.modPermissionCheck(rank, target.rank);
    try {
      const deleted = await this.deleteLobbyBan(targetId);
      return this.convertBan(deleted);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new ConflictException(AdmErrMsg.NOT_BAN);
      }
      throw err;
    }
  }

  async moderateLobbyMessage(
    userId: string,
    rank: Ranks,
    messageId: string,
  ): Promise<LobbyMessageSingle> {
    await this.jwtRankIsValid(userId, rank);
    const message = await this.findLobbyMessage(messageId);
    if (!message) {
      throw new NotFoundException(AdmErrMsg.MSG_NOT_FOUND);
    }
    if (message.senderId) {
      this.selfCheck(userId, message.senderId, AdmErrMsg.LOBBY_SELF);
      const target = await this.userService.userExistsOrThrow(message.senderId);
      this.modPermissionCheck(rank, target.rank);
    }
    return this.updateLobbyMessageModerated(messageId);
  }

  async fetchBanList(userId: string, rank: Ranks): Promise<UserProfile[]> {
    await this.jwtRankIsValid(userId, rank);
    const users = await this.findAllLobbyBans();
    return this.convertBanList(users);
  }

  // HELPER FUNCTIONS
  private async jwtRankIsValid(userId: string, rank: Ranks): Promise<void> {
    const found = await this.userService.userExistsOrThrow(userId);
    if (rank !== found.rank) {
      throw new UnauthorizedException(AdmErrMsg.JWT_RANK_INVALID);
    }
  }

  private selfCheck(userId: string, targetId: string, errorMsg: string): void {
    if (userId === targetId) {
      throw new UnauthorizedException(errorMsg);
    }
  }

  private modPermissionCheck(user: Ranks, target: Ranks): void {
    if (
      user === Ranks.MODERATOR &&
      target !== Ranks.USER &&
      target !== Ranks.PENDING
    ) {
      throw new UnauthorizedException(AdmErrMsg.WRONG_RANK);
    }
  }

  private convertBan(ban: BannedUser): UserProfile {
    const raw = ban.user;
    return encodeSingleAvatar(raw);
  }

  private convertBanList(bans: BannedUser[]): UserProfile[] {
    const raw = bans.map((ban) => {
      return ban.user;
    });
    return encodeMultipleAvatars(raw);
  }

  // LOBBY BAN DB ACCESS
  private async createLobbyBan(userId: string): Promise<BannedUser> {
    return await this.prisma.lobbyBan.create({
      data: { userId },
      select: banSelect,
    });
  }

  private async deleteLobbyBan(userId: string): Promise<BannedUser> {
    return await this.prisma.lobbyBan.delete({
      where: { userId },
      select: banSelect,
    });
  }

  private async findAllLobbyBans(): Promise<BannedUser[]> {
    return await this.prisma.lobbyBan.findMany({
      where: {},
      select: banSelect,
      orderBy: banListOrder,
    });
  }

  // LOBBY MESSAGE DB ACCESS
  private async findLobbyMessage(
    id: string,
  ): Promise<LobbyMessageSingle | null> {
    return await this.prisma.lobbyMessage.findUnique({
      where: { id },
      select: lobbyMessageSelect,
    });
  }

  private async updateLobbyMessageModerated(
    id: string,
  ): Promise<LobbyMessageSingle> {
    return await this.prisma.lobbyMessage.update({
      where: { id },
      data: lobbyModeratedData,
      select: lobbyMessageSelect,
    });
  }
}
