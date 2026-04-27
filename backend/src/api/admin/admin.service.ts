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
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import { decodeAvatarBase64 } from '../user/utils/user.validator';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async adminModifyUser(userId: string, rank: Ranks, dto: AdminUpdateUserDto) {
    if (userId === dto.targetId) {
      throw new UnauthorizedException(AdmErrMsg.OWN_PROFILE);
    }
    const target = await this.userService.userExistsOrThrow(dto.targetId);
    if (rank === Ranks.MODERATOR && target.rank !== Ranks.USER) {
      throw new UnauthorizedException(AdmErrMsg.WRONG_RANK);
    }
    return this.userService.adminUpdateUser(dto);
  }
}
