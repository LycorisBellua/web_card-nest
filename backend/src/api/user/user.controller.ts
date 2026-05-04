import {
  Controller,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateRankDto } from './dto/update-rank.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RankGuard } from '../auth/guards/auth.rankguard';
import { Ranks } from 'src/generated/prisma/enums';
import { RequiredRank } from '../auth/guards/auth.rank-decorator';
import type { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ADD / REMOVE
  // Add user moved to auth controller

  @Delete(':userId')
  async removeUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.userService.removeUser(userId);
  }

  // UPDATE ENTRIES
  // For Patch Methods: id can be taken from auth token once implemented
  @Patch(':userId/rank')
  async updateRank(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateRankDto: UpdateRankDto,
  ) {
    return await this.userService.updateRank(userId, updateRankDto.rank);
  }

  @Patch(':userId/update')
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, updateUserDto);
  }

  @Patch(':userId/password')
  async updatePassword(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  // FETCH USERS
  @Get('id/:userId')
  async getUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.userService.getUserById(userId);
  }

  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string) {
    return await this.userService.getUserByUsername(username);
  }

  @UseGuards(AuthGuard, RankGuard)
  @RequiredRank(Ranks.USER)
  @Get('all/username')
  async getAllSortByUsername(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return await this.userService.getAllSortByUsername(user.rank as Ranks);
  }

  @UseGuards(AuthGuard, RankGuard)
  @RequiredRank(Ranks.USER)
  @Get('all/date')
  async getAllSortByDate(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return await this.userService.getAllSortByDate(user.rank as Ranks);
  }
}
