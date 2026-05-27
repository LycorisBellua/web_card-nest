import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Ranks } from 'src/generated/prisma/enums';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdmErrMsg } from './errors/admin-error-messages';
import { UpdateRankDto } from './dto/update-rank.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  BanList,
  BanListRaw,
  lobbyBanInclude,
  lobbyBanOrder,
} from './types/admin.types';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async adminModifyUser(userId: string, rank: Ranks, dto: AdminUpdateUserDto) {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, dto.targetId, AdmErrMsg.OWN_PROFILE);
    const target = await this.userService.userExistsOrThrow(dto.targetId);
    this.modPermissionCheck(rank, target.rank);
    return this.userService.adminUpdateUser(dto);
  }

  async adminModifyRank(userId: string, rank: Ranks, dto: UpdateRankDto) {
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

  async adminRemoveUser(adminId: string, adminRank: Ranks, targetId: string) {
    await this.jwtRankIsValid(adminId, adminRank);
    this.selfCheck(adminId, targetId, AdmErrMsg.OWN_PROFILE);
    return await this.userService.removeUser(targetId);
  }

  async lobbyChatBan(userId: string, rank: Ranks, targetId: string) {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, targetId, AdmErrMsg.SELF_BAN);
    const target = await this.userService.userExistsOrThrow(targetId);
    this.modPermissionCheck(rank, target.rank);
    try {
      return this.createLobbyBan(targetId);
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

  async lobbyChatUnban(userId: string, rank: Ranks, targetId: string) {
    await this.jwtRankIsValid(userId, rank);
    this.selfCheck(userId, targetId, AdmErrMsg.SELF_BAN);
    const target = await this.userService.userExistsOrThrow(targetId);
    this.modPermissionCheck(rank, target.rank);
    try {
      return this.deleteLobbyBan(targetId);
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

  async fetchBanList(userId: string, rank: Ranks): Promise<BanList> {
    await this.jwtRankIsValid(userId, rank);
    const users = await this.findAllLobbyBans();
    return this.buildBanList(users);
  }

  // HELPER FUNCTIONS
  private async jwtRankIsValid(userId: string, rank: Ranks) {
    const found = await this.userService.userExistsOrThrow(userId);
    if (rank !== found.rank) {
      throw new UnauthorizedException(AdmErrMsg.JWT_RANK_INVALID);
    }
  }

  private selfCheck(userId: string, targetId: string, errorMsg: string) {
    if (userId === targetId) {
      throw new UnauthorizedException(errorMsg);
    }
  }

  private modPermissionCheck(user: Ranks, target: Ranks) {
    if (
      user === Ranks.MODERATOR &&
      target !== Ranks.USER &&
      target !== Ranks.PENDING
    ) {
      throw new UnauthorizedException(AdmErrMsg.WRONG_RANK);
    }
  }

  private buildBanList(raw: BanListRaw): BanList {
    return raw.map((ban) => {
      return {
        username: ban.user.username,
        userId: ban.userId,
        date: ban.date,
      };
    });
  }

  // LOBBY BAN DB ACCESS
  private async createLobbyBan(userId: string) {
    return await this.prisma.lobbyBan.create({
      data: { userId },
    });
  }

  private async deleteLobbyBan(userId: string) {
    return await this.prisma.lobbyBan.delete({
      where: { userId },
    });
  }

  private async findAllLobbyBans(): Promise<BanListRaw> {
    return await this.prisma.lobbyBan.findMany({
      where: {},
      include: lobbyBanInclude,
      orderBy: lobbyBanOrder,
    });
  }
}
