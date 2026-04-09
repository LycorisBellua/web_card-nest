import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ErrorMessages } from './error_messages/ErrorMessages';
import { Ranks } from 'src/generated/prisma/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { decodeAvatarBase64 } from './utils/user.validator';
import {
  getCurrentTime,
  getVerificationTimeout,
  getVerificationToken,
  newPasswordContainsUsername,
  newPasswordContainsEmail,
} from './utils/user.utils';
import { UserEmailsService } from './user-emails.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userEmailsService: UserEmailsService,
  ) {}

  // CALLED FROM USER CONTROLLER
  async removeUser(userId: string) {
    const found = await this.userExistsOrThrow(userId);
    const result = await this.deleteUser(userId);
    const address = found.email ? found.email : found.email_unverified;
    if (address) {
      await this.userEmailsService.sendDeletionEmail(address);
    }
    return result;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    await this.userExistsOrThrow(userId);
    const data: Record<string, unknown> = {};

    if (updateUserDto.username !== undefined) {
      if (await this.usernameIsTaken(updateUserDto.username)) {
        throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
      }
      data.username = updateUserDto.username;
    }

    if (updateUserDto.email_unverified !== undefined) {
      if (await this.emailAddressIsTaken(updateUserDto.email_unverified)) {
        throw new ConflictException(ErrorMessages.EMAIL_USED);
      }
      data.email_unverified = updateUserDto.email_unverified;
      data.verifyToken = getVerificationToken();
      data.verifyTimeout = getVerificationTimeout();
    }

    if (updateUserDto.avatar !== undefined) {
      if (updateUserDto.avatar === '') {
        data.avatar = null;
      } else {
        const decoded = decodeAvatarBase64(updateUserDto.avatar);
        if (decoded === null) {
          throw new BadRequestException(ErrorMessages.INVALID_AVATAR);
        }
        data.avatar = decoded;
      }
    }

    if (updateUserDto.desc !== undefined) {
      if (updateUserDto.desc === '') {
        data.desc = null;
      } else {
        data.desc = updateUserDto.desc;
      }
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(ErrorMessages.NO_DATA);
    }

    const updated = await this.modifyUserInfo(userId, data);
    if (updated.email_unverified) {
      const found = await this.userExistsOrThrow(userId);
      if (found.email_unverified && found.verifyToken) {
        await this.userEmailsService.sendVerificationEmail(
          userId,
          found.email_unverified,
          found.verifyToken,
        );
      }
    }
    return updated;
  }

  // TODO: Hash Password
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userExistsOrThrow(userId);
    const newPassword = updatePasswordDto.newPassword;
    const currentPassword = updatePasswordDto.oldPassword;
    const email = user.email === null ? user.email_unverified : user.email;
    if (newPasswordContainsUsername(newPassword, user.username)) {
      throw new BadRequestException(ErrorMessages.USERNAME_IN_PASSWORD);
    }
    if (newPasswordContainsEmail(newPassword, email)) {
      throw new BadRequestException(ErrorMessages.EMAIL_IN_PASSWORD);
    }
    if (user.password !== currentPassword) {
      throw new BadRequestException(ErrorMessages.CURRENT_PASS_INCORRECT);
    }
    return await this.modifyPassword(userId, newPassword);
  }

  async updateRank(userId: string, newRank: Ranks) {
    await this.userExistsOrThrow(userId);
    return await this.modifyRank(userId, newRank);
  }

  async getUserById(toFind: string) {
    const found = await this.prisma.user.findUnique({
      where: { id: toFind },
      omit: { password: true },
    });
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return {
      ...found,
      avatar: found.avatar
        ? Buffer.from(found.avatar).toString('base64')
        : null,
    };
  }

  async getUserByUsername(toFind: string) {
    const found = await this.prisma.user.findFirst({
      where: { username: { equals: toFind, mode: 'insensitive' } },
      omit: { password: true },
    });
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return {
      ...found,
      avatar: found.avatar
        ? Buffer.from(found.avatar).toString('base64')
        : null,
    };
  }

  async getAllSortByUsername() {
    const users = await this.prisma.user.findMany({
      omit: { password: true },
      orderBy: { username: 'asc' },
    });
    return users.map((user) => ({
      ...user,
      avatar: user.avatar ? Buffer.from(user.avatar).toString('base64') : null,
    }));
  }

  async getAllSortByDate() {
    const users = await this.prisma.user.findMany({
      omit: { password: true },
      orderBy: { date: 'asc' },
    });
    return users.map((user) => ({
      ...user,
      avatar: user.avatar ? Buffer.from(user.avatar).toString('base64') : null,
    }));
  }

  // CALLED FROM USER-TASKS SERVICE
  async unverifiedUserCleanup() {
    const time = getCurrentTime();
    const toDelete = await this.expiredUsersToDelete(time);
    await this.deleteExpiredUnverified(time);
    await this.modifyExpiredUnverified(time);
    for (const user of toDelete) {
      if (user.email_unverified) {
        await this.userEmailsService.sendExpiredDeletionEmail(
          user.email_unverified,
        );
      }
    }
  }

  // CALLED FROM AUTH SERVICE
  // TODO: Hash password
  async addUser(createUserDto: CreateUserDto) {
    if (await this.usernameIsTaken(createUserDto.username)) {
      throw new ConflictException(ErrorMessages.USERNAME_TAKEN);
    }
    if (await this.emailAddressIsTaken(createUserDto.email_unverified)) {
      throw new ConflictException(ErrorMessages.EMAIL_USED);
    }
    const created = await this.createUser(createUserDto);
    const found = await this.userExistsOrThrow(created.id);
    if (found.email_unverified && found.verifyToken) {
      await this.userEmailsService.sendVerificationEmail(
        created.id,
        found.email_unverified,
        found.verifyToken,
      );
    }
    return created;
  }

  async verifyEmail(userId: string, token: string) {
    const found = await this.userExists(userId);
    if (
      !found ||
      !found.verifyToken ||
      found.verifyToken !== token ||
      !found.email_unverified ||
      !found.verifyTimeout ||
      found.verifyTimeout < new Date()
    ) {
      return null;
    }
    const verified = await this.modifyVerifyEmail(
      userId,
      found.email_unverified,
    );
    if (!verified || !verified.email) {
      return null;
    }
    await this.deleteUnverifiedWithTakenEmail(verified.email);
    await this.modifyVerifiedWithTakenEmail(verified.email);
    await this.userEmailsService.sendVerificationSuccess(verified.email);
    return verified;
  }

  async resendVerificationEmail(userId: string) {
    const found = await this.userExistsOrThrow(userId);
    if (!found.email_unverified) {
      return { id: userId };
    }
    const data: Record<string, unknown> = {};
    data.verifyToken = getVerificationToken();
    data.verifyTimeout = getVerificationTimeout();
    const result = await this.modifyVerificationData(userId, data);
    const updated = await this.userExistsOrThrow(userId);
    if (updated.email_unverified && updated.verifyToken) {
      await this.userEmailsService.sendVerificationEmail(
        userId,
        updated.email_unverified,
        updated.verifyToken,
      );
    }
    return result;
  }

  // DB ACTIONS (INTERNAL USE ONLY - ONLY CALLED AFTER VALIDATION)
  // TODO: Hash token
  private async createUser(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email_unverified: createUserDto.email_unverified,
        password: createUserDto.password,
        verifyToken: getVerificationToken(),
        verifyTimeout: getVerificationTimeout(),
      },
      select: { id: true, username: true, date: true },
    });
  }

  private async deleteUser(userId: string) {
    return await this.prisma.user.delete({
      where: { id: userId },
      select: { id: true },
    });
  }

  private async modifyVerifyEmail(userId: string, address: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: address,
        email_unverified: null,
        verifyTimeout: null,
        verifyToken: null,
      },
      select: { email: true },
    });
  }

  private async modifyVerificationData(
    userId: string,
    newData: Record<string, unknown>,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: newData,
      select: { id: true },
    });
  }

  private async deleteUnverifiedWithTakenEmail(address: string | null) {
    return await this.prisma.user.deleteMany({
      where: { email: null, email_unverified: address },
    });
  }

  private async modifyVerifiedWithTakenEmail(address: string | null) {
    return await this.prisma.user.updateMany({
      where: { email_unverified: address },
      data: { email_unverified: null, verifyTimeout: null, verifyToken: null },
    });
  }

  private async deleteExpiredUnverified(time: Date) {
    await this.prisma.user.deleteMany({
      where: { verifyTimeout: { lt: time }, email: null },
    });
  }

  private async modifyExpiredUnverified(time: Date) {
    await this.prisma.user.updateMany({
      where: { verifyTimeout: { lt: time }, email: { not: null } },
      data: { email_unverified: null, verifyTimeout: null, verifyToken: null },
    });
  }

  private async modifyUserInfo(
    userId: string,
    newData: Record<string, unknown>,
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: newData,
      select: { desc: true, email_unverified: true, username: true },
    });
  }

  private async modifyPassword(userID: string, newPassword: string) {
    return await this.prisma.user.update({
      where: { id: userID },
      data: { password: newPassword },
      select: { id: true },
    });
  }

  private async modifyRank(userId: string, newRank: Ranks) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { rank: newRank },
      select: { rank: true },
    });
  }

  // USER LOOKUP (INTERNAL USE ONLY)
  async userExistsOrThrow(toFind: string) {
    const found = await this.prisma.user.findUnique({
      where: { id: toFind },
      select: {
        email: true,
        email_unverified: true,
        password: true,
        username: true,
        verifyToken: true,
        verifyTimeout: true,
      },
    });
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return found;
  }

  private async userExists(toFind: string) {
    return await this.prisma.user.findUnique({
      where: { id: toFind },
      select: {
        email: true,
        email_unverified: true,
        password: true,
        username: true,
        verifyToken: true,
        verifyTimeout: true,
      },
    });
  }

  private async usernameIsTaken(toFind: string) {
    const found = await this.prisma.user.findUnique({
      where: { username: toFind },
      select: { username: true },
    });
    return found !== null;
  }

  private async emailAddressIsTaken(toFind: string) {
    const found = await this.prisma.user.findUnique({
      where: { email: toFind },
      select: { email: true },
    });
    return found !== null;
  }

  private async expiredUsersToDelete(time: Date) {
    return await this.prisma.user.findMany({
      where: { verifyTimeout: { lt: time }, email: null },
    });
  }
}
