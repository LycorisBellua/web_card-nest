import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ranks } from 'src/generated/prisma/enums';

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const admins = await this.prisma.user.findMany({
      where: { rank: Ranks.ADMIN },
    });

    if (admins.length > 1) {
      this.logger.error('Multiple admins found. Stopping now');
      process.exit(1);
    }

    const adminUsername = process.env.ADMIN_USER;

    if (!adminUsername) {
      if (admins.length === 1) {
        this.logger.log(
          `No ADMIN_USER environment variable set. ${admins[0].username} remains admin. Starting.`,
        );
      } else {
        this.logger.log(
          'No ADMIN_USER environment variable set and no existing admin. Starting without admin.',
        );
      }
      return;
    }

    const newAdmin = await this.prisma.user.findFirst({
      where: { username: { equals: adminUsername, mode: 'insensitive' } },
    });

    if (!newAdmin) {
      if (admins.length === 1) {
        this.logger.log(
          `No user matching ${adminUsername} exists. ${admins[0].username} remains admin. Starting.`,
        );
      } else {
        this.logger.log(
          `No user matching ${adminUsername} exists. Starting without admin`,
        );
      }
      return;
    }

    if (newAdmin.rank === Ranks.ADMIN) {
      this.logger.log(
        `User ${newAdmin.username} is already the Admin. Continuing startup.`,
      );
    }

    if (newAdmin.rank !== Ranks.ADMIN) {
      if (admins.length === 1) {
        await this.prisma.user.update({
          where: { id: admins[0].id },
          data: { rank: Ranks.MODERATOR },
        });
        this.logger.log(`${admins[0].username} demoted to MODERATOR.`);
      }
      await this.prisma.user.update({
        where: { id: newAdmin.id },
        data: { rank: Ranks.ADMIN },
      });
      this.logger.log(`${newAdmin.username} set as Admin. Starting.`);
    }
  }
}
