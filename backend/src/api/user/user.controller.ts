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
  addUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.addUser(createUserDto);
  }

  @Delete(':userId')
  removeUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.removeUser(userId);
  }

  // UPDATE ENTRIES
  // For Patch Methods: id can be taken from auth token once implemented
  @Patch(':userId/username')
  updateUsername(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return this.userService.updateUsername(userId, updateUsernameDto);
  }

  @Patch(':userId/verify')
  verifyEmail(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.verifyEmail(userId);
  }

  @Patch(':userId/desc')
  updateDesc(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateDescDto: UpdateDescDto,
  ) {
    return this.userService.updateDesc(userId, updateDescDto);
  }

  @Patch(':userId/avatar')
  updateAvatar(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ) {
    return this.userService.updateAvatar(userId, updateAvatarDto);
  }

  @Patch(':userId/rank')
  updateRank(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateRankDto: UpdateRankDto,
  ) {
    return this.userService.updateRank(userId, updateRankDto);
  }

  // FETCH USERS
  @Get('id/:userId')
  getUserbyId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.findByIdOrThrow(userId);
  }

  @Get('username/:username')
  getUserByUsername(@Param('username') username: string) {
    return this.userService.findByUsernameOrThrow(username);
  }

  @Get('all/username')
  getAllSortByUsername() {
    return this.userService.returnAllSortByUsername();
  }

  @Get('all/date')
  getAllSortByDate() {
    return this.userService.returnAllSortByDate();
  }
}
