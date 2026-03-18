import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateDescDto } from './dto/update-desc.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add')
  addUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.addUser(createUserDto);
  }

  @Delete(':userId/remove')
  removeUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.removeUser(userId);
  }

  // For Patch Methods: Id can be taken from auth token once implemented
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
}
