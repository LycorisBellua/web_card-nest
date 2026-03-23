import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateDescDto } from './dto/update-desc.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateRankDto } from './dto/update-rank.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ADD / REMOVE
  @Post()
  async addUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.addUser(createUserDto);
  }

  @Delete(':userId')
  async removeUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.userService.removeUser(userId);
  }

  // UPDATE ENTRIES
  // For Patch Methods: id can be taken from auth token once implemented
  @Patch(':userId/username')
  async updateUsername(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return await this.userService.updateUsername(
      userId,
      updateUsernameDto.username,
    );
  }

  @Patch(':userId/verify')
  async verifyEmail(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.userService.verifyEmail(userId);
  }

  @Patch(':userId/desc')
  async updateDesc(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateDescDto: UpdateDescDto,
  ) {
    return await this.userService.updateDesc(userId, updateDescDto.desc);
  }

  @Patch(':userId/avatar')
  async updateAvatar(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ) {
    return await this.userService.updateAvatar(userId, updateAvatarDto.avatar);
  }

  @Patch(':userId/rank')
  async updateRank(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateRankDto: UpdateRankDto,
  ) {
    return await this.userService.updateRank(userId, updateRankDto.rank);
  }

  // FETCH USERS
  @Get('id/:userId')
  async getUserbyId(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.userService.findByIdOrThrow(userId);
  }

  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string) {
    return await this.userService.findByUsernameOrThrow(username);
  }

  @Get('all/username')
  async getAllSortByUsername() {
    return await this.userService.returnAllSortByUsername();
  }

  @Get('all/date')
  async getAllSortByDate() {
    return await this.userService.returnAllSortByDate();
  }
}
