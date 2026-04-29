import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Ranks } from 'src/generated/prisma/enums';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdmErrMsg } from './errors/admin-error-messages';
import { UpdateRankDto } from './dto/update-rank.dto';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async adminModifyUser(userId: string, rank: Ranks, dto: AdminUpdateUserDto) {
    await this.jwtRankIsValid(userId, rank);
    if (userId === dto.targetId) {
      throw new BadRequestException(AdmErrMsg.OWN_PROFILE);
    }
    const target = await this.userService.userExistsOrThrow(dto.targetId);
    if (
      rank === Ranks.MODERATOR &&
      target.rank !== Ranks.USER &&
      target.rank !== Ranks.PENDING
    ) {
      throw new UnauthorizedException(AdmErrMsg.WRONG_RANK);
    }
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
    if (adminId === targetId) {
      throw new BadRequestException(AdmErrMsg.OWN_PROFILE);
    }
    return await this.userService.removeUser(targetId);
  }

  private async jwtRankIsValid(userId: string, rank: Ranks) {
    const found = await this.userService.userExistsOrThrow(userId);
    if (rank !== found.rank) {
      throw new UnauthorizedException(AdmErrMsg.JWT_RANK_INVALID);
    }
  }
}
