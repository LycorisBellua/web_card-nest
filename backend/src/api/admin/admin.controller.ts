import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequiredRank } from '../auth/guards/auth.rank-decorator';
import { Ranks } from 'src/generated/prisma/enums';
import type { Request as ExpressRequest } from 'express';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RankGuard } from '../auth/guards/auth.rankguard';
import { UpdateRankDto } from './dto/update-rank.dto';
import { AdmUuidDto } from './dto/adm-uuid.dto';
import { MessageUuidDto } from './dto/message.dto';
import { UserProfile } from '../user/types/user.types';
import {} from './types/admin.types';
import { LobbyMessageSingle } from '../chat/types/chat.types';

@UseGuards(AuthGuard, RankGuard)
@RequiredRank(Ranks.MODERATOR)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('modify')
  async adminModifyUser(
    @Req() req: ExpressRequest,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ): Promise<UserProfile> {
    const user = req['user'] as JwtPayload;
    return await this.adminService.adminModifyUser(
      user.id,
      user.rank as Ranks,
      adminUpdateUserDto,
    );
  }

  @Patch('rank')
  async adminModifyRank(
    @Req() req: ExpressRequest,
    @Body() dto: UpdateRankDto,
  ): Promise<UserProfile> {
    const user = req['user'] as JwtPayload;
    return await this.adminService.adminModifyRank(
      user.id,
      user.rank as Ranks,
      dto,
    );
  }

  @RequiredRank(Ranks.ADMIN)
  @Delete(':userId')
  async adminRemoveUser(
    @Req() req: ExpressRequest,
    @Param('userId', ParseUUIDPipe) targetId: string,
  ): Promise<UserProfile> {
    const user = req['user'] as JwtPayload;
    return await this.adminService.adminRemoveUser(
      user.id,
      user.rank as Ranks,
      targetId,
    );
  }

  @Post('ban')
  async lobbyChatBan(
    @Req() req: ExpressRequest,
    @Body() dto: AdmUuidDto,
  ): Promise<UserProfile> {
    const user = req['user'] as JwtPayload;
    return await this.adminService.lobbyChatBan(
      user.id,
      user.rank as Ranks,
      dto.targetId,
    );
  }

  @Delete('ban/:targetId')
  async lobbyChatUnban(
    @Req() req: ExpressRequest,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ): Promise<UserProfile> {
    const user = req['user'] as JwtPayload;
    return await this.adminService.lobbyChatUnban(
      user.id,
      user.rank as Ranks,
      targetId,
    );
  }

  @Get('ban')
  async fetchBanList(@Req() req: ExpressRequest): Promise<UserProfile[]> {
    const user = req['user'] as JwtPayload;
    return await this.adminService.fetchBanList(user.id, user.rank as Ranks);
  }

  @Patch('moderate')
  async moderateLobbyMessage(
    @Req() req: ExpressRequest,
    @Body() dto: MessageUuidDto,
  ): Promise<LobbyMessageSingle> {
    const user = req['user'] as JwtPayload;
    return this.adminService.moderateLobbyMessage(
      user.id,
      user.rank as Ranks,
      dto.messageId,
    );
  }
}
