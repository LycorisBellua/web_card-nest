import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add')
  addUser(
    @Body() body: { username: string; password: string; email?: string },
  ) {
    return this.userService.addUser(body);
  }
}
