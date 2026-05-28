import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class UserTasksService {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async unverifiedUserCleanup() {
    await this.userService.unverifiedUserCleanup();
  }
}
