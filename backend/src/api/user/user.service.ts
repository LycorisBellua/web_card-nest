import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async addUser(data: { username: string; password: string; email?: string }) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email?.toLowerCase(),
        password: data.password,
      },
    });
  }
}
