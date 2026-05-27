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
import { RelUuidDto } from '../relationships/dto/rel-uuid.dto';

@UseGuards(AuthGuard, RankGuard)
@RequiredRank(Ranks.MODERATOR)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('modify')
  async adminModifyUser(
    @Req() req: ExpressRequest,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
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
  ) {
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
  ) {
    const user = req['user'] as JwtPayload;
    return await this.adminService.adminRemoveUser(
      user.id,
      user.rank as Ranks,
      targetId,
    );
  }

  @Post('ban')
  async lobbyChatBan(@Req() req: ExpressRequest, @Body() dto: RelUuidDto) {
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
  ) {
    const user = req['user'] as JwtPayload;
    return await this.adminService.lobbyChatUnban(
      user.id,
      user.rank as Ranks,
      targetId,
    );
  }

  @Get('ban')
  async fetchBanList(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return await this.adminService.fetchBanList(user.id, user.rank as Ranks);
  }
}
