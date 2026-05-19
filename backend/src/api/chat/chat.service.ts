import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatParticipants, NewMessage } from './types/chat.types';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  //try / catch for errors
  async getOrCreateChatId(sender: string, receiver: string) {
    const sorted = this.sortUserIds(sender, receiver);
    const chat = await this.createChat(sorted);
    return chat.id;
  }

  async saveMessage(chatId: string, senderId: string, message: string) {
    if (message.length > 500) {
      throw new BadRequestException('Max message length is 500 chars');
    }
    const saved = await this.createMessage({
      chatId: chatId,
      senderId: senderId,
      message: message,
    });
  }

  // HELPER FUNCTIONS
  private sortUserIds(sender: string, receiver: string): ChatParticipants {
    if (sender < receiver) {
      return { userAId: sender, userBId: receiver };
    }
    return { userAId: receiver, userBId: sender };
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
}
