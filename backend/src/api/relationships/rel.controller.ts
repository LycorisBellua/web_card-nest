import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RelService } from './rel.service';
import { RelUuidDto } from './dto/rel-uuid.dto';

@Controller('api/rel')
export class RelController {
  constructor(private readonly relService: RelService) {}

  // FRIEND MANAGEMENT
  @Post('/friend/:originId')
  async addFriend(
    @Param('originId', ParseUUIDPipe) originId: string,
    @Body() relUuidDto: RelUuidDto,
  ) {
    return await this.relService.addFriend(originId, relUuidDto.targetId);
  }

  @Delete('/friend/:originId/:targetId')
  async removeFriend(
    @Param('originId', ParseUUIDPipe) originId: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return await this.relService.removeFriend(originId, targetId);
  }

  @Patch('friend/:originId/accept')
  async acceptRequest(
    @Param('originId', ParseUUIDPipe) originId: string,
    @Body() relUuidDto: RelUuidDto,
  ) {
    return await this.relService.acceptRequest(originId, relUuidDto.targetId);
  }

  @Delete('friend/:originId/reject/:targetId')
  async rejectRequest(
    @Param('originId', ParseUUIDPipe) originId: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return await this.relService.rejectRequest(originId, targetId);
  }

  @Delete('friend/:originId/cancel/:targetId')
  async cancelRequest(
    @Param('originId', ParseUUIDPipe) originId: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return await this.relService.cancelRequest(originId, targetId);
  }

  @Get('friend/:originId')
  async fetchFriends(@Param('originId', ParseUUIDPipe) originId: string) {
    return await this.relService.fetchFriends(originId);
  }

  @Get('friend/:originId/sent')
  async fetchSentRequests(@Param('originId', ParseUUIDPipe) originId: string) {
    return await this.relService.fetchSentRequests(originId);
  }

  @Get('friend/:originId/received')
  async fetchReceivedRequests(
    @Param('originId', ParseUUIDPipe) originId: string,
  ) {
    return await this.relService.fetchReceivedRequests(originId);
  }

  // BLOCK MANAGEMENT
  @Post('block/:originId')
  async blockUser(
    @Param('originId', ParseUUIDPipe) originId: string,
    @Body() relUuidDto: RelUuidDto,
  ) {
    return await this.relService.blockUser(originId, relUuidDto.targetId);
  }

  @Delete('block/:originId/:targetId')
  async unblockUser(
    @Param('originId', ParseUUIDPipe) originId: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return await this.relService.unblockUser(originId, targetId);
  }

  @Get('block/:originId')
  async fetchBlocked(@Param('originId', ParseUUIDPipe) originId: string) {
    return await this.relService.fetchBlocked(originId);
  }
}
