import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ErrorMessages } from './error_messages/ErrorMessages';
import { Ranks } from 'src/generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ADD / REMOVE
  async addUser(createUserDto: CreateUserDto) {
    if (await this.findByUsername(createUserDto.username)) {
      throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
    }

    if (await this.findByEmailAddress(createUserDto.email_unverified)) {
      throw new ConflictException(ErrorMessages.EMAIL_USED);
    }

    return await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email_unverified: createUserDto.email_unverified,
        password: createUserDto.password,
      },
      omit: { password: true },
    });
  }

  async removeUser(userId: string) {
    await this.findByIdOrThrow(userId);
    return await this.prisma.user.delete({
      where: { id: userId },
      omit: { password: true },
    });
  }

  // UPDATE ENTRIES
  async updateUsername(userId: string, newUsername: string) {
    await this.findByIdOrThrow(userId);
    if (await this.findByUsername(newUsername)) {
      throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
    }
    return await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
      omit: { password: true },
    });
  }

  async verifyEmail(userId: string) {
    const found = await this.findByIdOrThrow(userId);
    if (!found.email_unverified) {
      throw new BadRequestException(ErrorMessages.NO_EMAIL);
    }
    return await this.prisma.user.update({
      where: { id: userId },
      data: { email: found.email_unverified, email_unverified: null },
      omit: { password: true },
    });
  }

  async updateDesc(userId: string, newDesc: string) {
    await this.findByIdOrThrow(userId);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { desc: newDesc },
      omit: { password: true },
    });
  }

  async updateAvatar(userId: string, newAvatar: string) {
    await this.findByIdOrThrow(userId);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: newAvatar },
      omit: { password: true },
    });
  }

  async updateRank(userId: string, newRank: Ranks) {
    await this.findByIdOrThrow(userId);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { rank: newRank },
      omit: { password: true },
    });
  }

  // FETCH USERS
  async findByIdOrThrow(toFind: string) {
    const found = await this.findById(toFind);
    if (!found) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }
    return found;
  }

  async findByUsernameOrThrow(toFind: string) {
    const found = await this.findByUsername(toFind);
    if (!found) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }
    return found;
  }

  async returnAllSortByUsername() {
    return await this.prisma.user.findMany({
      omit: { password: true },
      orderBy: { username: 'asc' },
    });
  }

  async returnAllSortByDate() {
    return await this.prisma.user.findMany({
      omit: { password: true },
      orderBy: { date: 'asc' },
    });
  }

  // USER LOOKUP (INTERNAL USE)
  async findById(toFind: string) {
    return await this.prisma.user.findUnique({
      where: { id: toFind },
      omit: { password: true },
    });
  }

  async findByUsername(toFind: string) {
    return await this.prisma.user.findFirst({
      where: { username: { equals: toFind, mode: 'insensitive' } },
      omit: { password: true },
    });
  }

  async findByEmailAddress(toFind: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: toFind, mode: 'insensitive' } },
          { email_unverified: { equals: toFind, mode: 'insensitive' } },
        ],
      },
      omit: { password: true },
    });
  }
}
