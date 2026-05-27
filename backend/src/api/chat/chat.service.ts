import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChatParticipants,
  MessageHistory,
  messageSelect,
  NewMessage,
} from './types/chat.types';
import { Prisma } from 'src/generated/prisma/client';
import { ChatError } from './errors/chat.errors';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getChatId(sender: string, receiver: string) {
    const sorted = this.sortUserIds(sender, receiver);
    try {
      return (await this.createChat(sorted)).id;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.handleErrors(err);
      }
      throw err;
    }
  }

  async saveMessage(chatId: string, senderId: string, message: string) {
    try {
      return await this.createMessage({
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

  async getMessages(chatId: string) {
    const message = await this.findMessages(chatId);
    console.log("GETmessage : ", message);

    return message ;
  }

  // HELPER FUNCTIONS
  private sortUserIds(sender: string, receiver: string): ChatParticipants {
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

  // DB ACCESS
  private async createChat(users: ChatParticipants): Promise<{ id: string }> {
    return await this.prisma.chat.upsert({
      where: { userAId_userBId: users },
      create: users,
      update: {},
      select: { id: true },
    });
  }

  private async createMessage(data: NewMessage): Promise<{ id: string }> {
    return await this.prisma.message.create({
      data: data,
      select: { id: true },
    });
  }

  private async findMessages(chatId: string): Promise<MessageHistory> {
    return await this.prisma.message.findMany({
      where: { chatId },
      select: messageSelect,
    });
  }

  // CALLED BY USERSERVICE.DELETEUSER()
  async removeOrphanedChats(): Promise<number> {
    const deleted = await this.prisma.chat.deleteMany({
      where: { userAId: null, userBId: null },
    });
    return deleted.count;
  }
}
