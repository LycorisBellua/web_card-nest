import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserTasksService {
  constructor(private readonly userService: UserService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async unverifiedUserCleanup() {
    await this.userService.unverifiedUserCleanup();
  }
}
