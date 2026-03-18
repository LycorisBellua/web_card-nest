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

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async addUser(createUserDto: CreateUserDto) {
    if (await this.findByUsername(createUserDto.username)) {
      throw new ConflictException('Username already taken');
    }

    if (await this.findByEmailAddress(createUserDto.email_unverified)) {
      throw new ConflictException('Email address already in use');
    }

    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email_unverified: createUserDto.email_unverified,
        password: createUserDto.password,
      },
      omit: { password: true },
    });
  }

  async removeUser(userId: string) {
    const found = await this.findById(userId);
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({
      where: { id: userId },
      omit: { password: true },
    });
  }

  async updateUsername(userId: string, updateUsernameDto: UpdateUsernameDto) {
    const found = await this.findById(userId);
    if (!found) {
      throw new NotFoundException('User not found');
    }
    if (await this.findByUsername(updateUsernameDto.username)) {
      throw new ConflictException('Username already taken');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { username: updateUsernameDto.username },
      omit: { password: true },
    });
  }

  async verifyEmail(userId: string) {
    const found = await this.findById(userId);
    if (!found) {
      throw new NotFoundException('User not found');
    }
    if (!found.email_unverified) {
      throw new BadRequestException('No email to verify');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { email: found.email_unverified, email_unverified: null },
      omit: { password: true },
    });
  }

  async updateDesc(userId: string, updateDescDto: UpdateDescDto) {
    const found = await this.findById(userId);
    if (!found) {
      return new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { desc: updateDescDto.desc },
      omit: { password: true },
    });
  }

  async findById(toFind: string) {
    return this.prisma.user.findUnique({ where: { id: toFind } });
  }

  async findByUsername(toFind: string) {
    return this.prisma.user.findFirst({
      where: { username: { equals: toFind, mode: 'insensitive' } },
    });
  }

  async findByEmailAddress(toFind: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: toFind, mode: 'insensitive' } },
          { email_unverified: { equals: toFind, mode: 'insensitive' } },
        ],
      },
    });
  }
}
