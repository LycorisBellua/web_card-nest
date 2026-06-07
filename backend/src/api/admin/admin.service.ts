import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Ranks } from 'src/generated/prisma/enums';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdmErrMsg } from './errors/admin-error-messages';
import { UpdateRankDto } from './dto/update-rank.dto';
import { LobbyBan, LobbyMessage, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { lobbyModeratedData } from './types/admin.types';
import { UserProfile } from '../user/types/user.types';
import { WebsocketServer } from '../websocketHandling/WebsocketServer.gateway';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WebsocketServer))
    private readonly wsGateway: WebsocketServer,
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
  ): Promise<void> {
    await this.jwtRankIsValid(adminId, adminRank);
    this.selfCheck(adminId, targetId, AdmErrMsg.OWN_PROFILE);
    await this.userService.removeUser(targetId);
  }

  async lobbyChatBan(
    userId: string,
    rank: Ranks,
    targetId: string,
  ): Promise<LobbyBan> {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, targetId, AdmErrMsg.LOBBY_SELF);
    const target = await this.userService.userExistsOrThrow(targetId);
    this.modPermissionCheck(rank, target.rank);
    try {
      const ban = await this.createLobbyBan(targetId);
      this.wsGateway.pushLobbyTimeoutStatus(targetId, true);
      return ban;
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

  async guestLobbyChatBan() {
    try {
      const targetId = 'Guest';
      const ban = await this.createLobbyBan(targetId);
      this.wsGateway.pushLobbyTimeoutStatus(targetId, true);
      return ban;
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
  ): Promise<LobbyBan> {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, targetId, AdmErrMsg.LOBBY_SELF);
    const target = await this.userService.userExistsOrThrow(targetId);
    this.modPermissionCheck(rank, target.rank);
    try {
      const ban = await this.deleteLobbyBan(targetId);
      this.wsGateway.pushLobbyTimeoutStatus(targetId, false);
      return ban;
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

  async guestLobbyChatUnban() {
    try {
      const targetId = 'Guest';
      const ban = await this.deleteLobbyBan(targetId);
      this.wsGateway.pushLobbyTimeoutStatus(targetId, false);
      return ban;
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

  async fetchBan(
    userId: string,
    rank: Ranks,
    targetId: string,
  ): Promise<LobbyBan | null> {
    await this.jwtRankIsValid(userId, rank);
    return await this.findLobbyBan(targetId);
  }

  async moderateLobbyMessage(
    userId: string,
    rank: Ranks,
    messageId: string,
  ): Promise<LobbyMessage> {
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

  // LOBBY BAN DB ACCESS
  private async createLobbyBan(userId: string): Promise<LobbyBan> {
    return await this.prisma.lobbyBan.create({
      data: { userId },
    });
  }

  private async deleteLobbyBan(userId: string): Promise<LobbyBan> {
    return await this.prisma.lobbyBan.delete({
      where: { userId },
    });
  }

  private async findLobbyBan(userId: string): Promise<LobbyBan | null> {
    return await this.prisma.lobbyBan.findUnique({
      where: { userId },
    });
  }

  // LOBBY MESSAGE DB ACCESS
  private async findLobbyMessage(id: string): Promise<LobbyMessage | null> {
    return await this.prisma.lobbyMessage.findUnique({
      where: { id },
    });
  }

  private async updateLobbyMessageModerated(id: string): Promise<LobbyMessage> {
    return await this.prisma.lobbyMessage.update({
      where: { id },
      data: lobbyModeratedData,
    });
  }
}
