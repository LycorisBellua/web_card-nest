import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { RequiredRank } from '../auth/guards/auth.rank-decorator';
import { Ranks } from 'src/generated/prisma/enums';
import type { Request as ExpressRequest } from 'express';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RankGuard } from '../auth/guards/auth.rankguard';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard, RankGuard)
  @RequiredRank(Ranks.MODERATOR)
  @Patch('modifyUser')
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
}
