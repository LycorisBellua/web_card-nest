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
import { RelService } from './rel.service';
import { RelUuidDto } from './dto/rel-uuid.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RankGuard } from '../auth/guards/auth.rankguard';
import { RequiredRank } from '../auth/guards/auth.rank-decorator';
import { Ranks } from 'src/generated/prisma/enums';
import type { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';

@UseGuards(AuthGuard, RankGuard)
@RequiredRank(Ranks.USER)
@Controller('api/rel')
export class RelController {
  constructor(private readonly relService: RelService) {}

  // FRIEND MANAGEMENT
  @Post('/friend/')
  async addFriend(@Req() req: ExpressRequest, @Body() relUuidDto: RelUuidDto) {
    const user = req['user'] as JwtPayload;
    return await this.relService.addFriend(user.id, relUuidDto.targetId);
  }

  @Delete('/friend/:targetId')
  async removeFriend(
    @Req() req: ExpressRequest,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    const user = req['user'] as JwtPayload;
    return await this.relService.removeFriend(user.id, targetId);
  }

  @Patch('friend/accept')
  async acceptRequest(
    @Req() req: ExpressRequest,
    @Body() relUuidDto: RelUuidDto,
  ) {
    const user = req['user'] as JwtPayload;
    return await this.relService.acceptRequest(user.id, relUuidDto.targetId);
  }

  @Delete('friend/reject/:targetId')
  async rejectRequest(
    @Req() req: ExpressRequest,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    const user = req['user'] as JwtPayload;
    return await this.relService.rejectRequest(user.id, targetId);
  }

  @Delete('friend/cancel/:targetId')
  async cancelRequest(
    @Req() req: ExpressRequest,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    const user = req['user'] as JwtPayload;
    return await this.relService.cancelRequest(user.id, targetId);
  }

  @Get('friend')
  async fetchFriends(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return await this.relService.fetchFriends(user.id);
  }

  @Get('friend/sent')
  async fetchSentRequests(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return await this.relService.fetchSentRequests(user.id);
  }

  @Get('friend/received')
  async fetchReceivedRequests(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return await this.relService.fetchReceivedRequests(user.id);
  }

  @Get('friend/:targetId')
  async fetchOtherUserFriends(
    @Req() req: ExpressRequest,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return await this.relService.fetchFriends(targetId);
  }

  // BLOCK MANAGEMENT
  @Post('block')
  async blockUser(@Req() req: ExpressRequest, @Body() relUuidDto: RelUuidDto) {
    const user = req['user'] as JwtPayload;
    return await this.relService.blockUser(user.id, relUuidDto.targetId);
  }

  @Delete('block/:targetId')
  async unblockUser(
    @Req() req: ExpressRequest,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    const user = req['user'] as JwtPayload;
    return await this.relService.unblockUser(user.id, targetId);
  }

  @Get('block')
  async fetchBlocked(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return await this.relService.fetchBlocked(user.id);
  }
}
