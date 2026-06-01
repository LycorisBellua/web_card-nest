import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ranks } from 'src/generated/prisma/enums';
import { createTokenHash } from '../api/user/utils/user.utils';

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const guestPassword = process.env.GUEST_PASSWORD;
    if (!guestPassword) {
      throw new InternalServerErrorException(
        'GUEST_PASSWORD env variable is not set',
      );
    }

    await this.prisma.user.upsert({
      where: { username: 'Guest' },
      create: {
        id: 'Guest',
        username: 'Guest',
        password: createTokenHash(guestPassword),
        rank: Ranks.PENDING,
      },
      update: {
        id: 'Guest',
        username: 'Guest',
        password: createTokenHash(guestPassword),
        rank: Ranks.PENDING,
      },
    });

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

    if (adminUsername.toLowerCase() === 'guest') {
      if (admins.length === 1) {
        this.logger.warn(
          `ADMIN_USER environment variable '${adminUsername}' is not allowed. ${admins[0].username} remains admin. Starting.`,
        );
      } else {
        this.logger.warn(
          `ADMIN_USER environment variable '${adminUsername}' is not allowed and no existing admin. Starting without admin.`,
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
    } else if (newAdmin.rank === Ranks.PENDING) {
      this.logger.error(
        `User ${newAdmin.username} cannot be promoted to ADMIN as they are unverified.`,
      );
    } else {
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
