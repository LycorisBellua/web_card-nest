import {
  Controller,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateDescDto } from './dto/update-desc.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

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
  @Patch(':userId/verify')
  async verifyEmail(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.userService.verifyEmail(userId);
  }

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

  @Get('all/username')
  async getAllSortByUsername() {
    return await this.userService.getAllSortByUsername();
  }

  @Get('all/date')
  async getAllSortByDate() {
    return await this.userService.getAllSortByDate();
  }
}
