import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateDescDto } from './dto/update-desc.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateRankDto } from './dto/update-rank.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ADD / REMOVE
  async addUser(createUserDto: CreateUserDto) {
    if (await this.findByUsername(createUserDto.username)) {
      throw new ConflictException('Username already taken');
    }

    if (await this.findByEmailAddress(createUserDto.email_unverified)) {
      throw new ConflictException('Email address already in use');
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
  async updateUsername(userId: string, updateUsernameDto: UpdateUsernameDto) {
    await this.findByIdOrThrow(userId);
    if (await this.findByUsername(updateUsernameDto.username)) {
      throw new ConflictException('Username already taken');
    }
    return await this.prisma.user.update({
      where: { id: userId },
      data: { username: updateUsernameDto.username },
      omit: { password: true },
    });
  }

  async verifyEmail(userId: string) {
    const found = await this.findByIdOrThrow(userId);
    if (!found.email_unverified) {
      throw new BadRequestException('No email to verify');
    }
    return await this.prisma.user.update({
      where: { id: userId },
      data: { email: found.email_unverified, email_unverified: null },
      omit: { password: true },
    });
  }

  async updateDesc(userId: string, updateDescDto: UpdateDescDto) {
    await this.findByIdOrThrow(userId);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { desc: updateDescDto.desc },
      omit: { password: true },
    });
  }

  async updateAvatar(userId: string, updateAvatarDto: UpdateAvatarDto) {
    await this.findByIdOrThrow(userId);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: updateAvatarDto.avatar },
      omit: { password: true },
    });
  }

  async updateRank(userId: string, updateRankDto: UpdateRankDto) {
    await this.findByIdOrThrow(userId);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { rank: updateRankDto.rank },
      omit: { password: true },
    });
  }

  // FETCH USERS
  async findByIdOrThrow(toFind: string) {
    const found = await this.findById(toFind);
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return found;
  }

  async findByUsernameOrThrow(toFind: string) {
    const found = await this.findByUsername(toFind);
    if (!found) {
      throw new NotFoundException('User not found');
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
