import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DMChatId,
  dMChatIdSelect,
  DMHistory,
  DMMessageId,
  dmMessageIdSelect,
  dMMessageOrderBy,
  dMMessageSelect,
  DMParticipants,
  LobbyHistory,
  LobbyMessageId,
  lobbyMessageIdSelect,
  lobbyMessageOrderBy,
  lobbyMessageSelect,
  NewDMMessage,
  NewLobbyMessage,
} from './types/chat.types';
import { Prisma, Ranks } from 'src/generated/prisma/client';
import { ChatError } from './errors/chat.errors';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getDMId(sender: string, receiver: string): Promise<DMChatId> {
    const sorted = this.sortUserIds(sender, receiver);
    try {
      await this.rankChecks(sender, receiver);
      return await this.createDMChat(sorted);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.handleErrors(err);
      }
      throw err;
    }
  }

  async saveDM(
    chatId: string,
    senderId: string,
    message: string,
  ): Promise<DMMessageId> {
    await this.participantCheck(senderId, chatId);
    try {
      return await this.createDMMessage({
        chatId: chatId,
        senderId: senderId,
        message: message,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.handleErrors(err);
      }
      throw err;
    }
  }

  async getDMHistory(userId: string, chatId: string): Promise<DMHistory> {
    await this.participantCheck(userId, chatId);
    return await this.findDMMessages(chatId);
  }

  async saveLobbyMessage(senderId: string, message: string) {
    await this.banCheck(senderId);
    try {
      return this.createLobbyMessage({ senderId, message });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.handleErrors(err);
      }
      throw err;
    }
  }

  async getLobbyHistory(): Promise<LobbyHistory> {
    return await this.findLobbyMessages();
  }

  // HELPER FUNCTIONS
  private sortUserIds(sender: string, receiver: string): DMParticipants {
    if (sender < receiver) {
      return { userAId: sender, userBId: receiver };
    }
    return { userAId: receiver, userBId: sender };
  }

  private handleErrors(err: Prisma.PrismaClientKnownRequestError): never {
    switch (err.code) {
      case 'P2003':
        throw new NotFoundException(ChatError.NOT_FOUND);
      case 'P2025':
        throw new NotFoundException(ChatError.NOT_FOUND);
      case 'P2000':
        throw new BadRequestException(ChatError.TOO_LONG);
      default:
        throw new InternalServerErrorException();
    }
  }

  private async rankChecks(userA: string, userB: string) {
    const a = await this.userService.userExistsOrThrow(userA);
    const b = await this.userService.userExistsOrThrow(userB);
    if (a.rank === Ranks.PENDING || b.rank === Ranks.PENDING) {
      throw new ForbiddenException(ChatError.WRONG_RANK);
    }
  }

  private async participantCheck(userId: string, chatId: string) {
    const chat = await this.participantLookup(userId, chatId);
    if (!chat) {
      throw new ForbiddenException(ChatError.WRONG_CHAT);
    }
  }

  private async banCheck(userId: string) {
    const ban = await this.findBan(userId);
    if (ban) {
      throw new ForbiddenException(ChatError.BANNED);
    }
  }

  // DB ACCESS
  private async createDMChat(users: DMParticipants): Promise<DMChatId> {
    return await this.prisma.dMChat.upsert({
      where: { userAId_userBId: users },
      create: users,
      update: {},
      select: dMChatIdSelect,
    });
  }

  private async createDMMessage(data: NewDMMessage): Promise<DMMessageId> {
    return await this.prisma.dMMessage.create({
      data: data,
      select: dmMessageIdSelect,
    });
  }

  private async findDMMessages(chatId: string): Promise<DMHistory> {
    return await this.prisma.dMMessage.findMany({
      where: { chatId },
      select: dMMessageSelect,
      orderBy: dMMessageOrderBy,
    });
  }

  private async createLobbyMessage(
    data: NewLobbyMessage,
  ): Promise<LobbyMessageId> {
    return await this.prisma.lobbyMessage.create({
      data: data,
      select: lobbyMessageIdSelect,
    });
  }

  private async findLobbyMessages(): Promise<LobbyHistory> {
    return await this.prisma.lobbyMessage.findMany({
      select: lobbyMessageSelect,
      orderBy: lobbyMessageOrderBy,
    });
  }

  private async findBan(userId: string) {
    return await this.prisma.lobbyBan.findUnique({
      where: { userId },
    });
  }

  private async participantLookup(userId: string, chatId: string) {
    return await this.prisma.dMChat.findFirst({
      where: { id: chatId, OR: [{ userAId: userId }, { userBId: userId }] },
    });
  }
}
