import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DMHistory,
  dMMessageInclude,
  dMMessageOrderBy,
  DMMessageRaw,
  DMParticipants,
  GDPRDMHistory,
  GDPRDMMessage,
  gDPRLobbyMessageSelect,
  gDPRDMessageSelect,
  LobbyHistory,
  LobbyHistoryRaw,
  lobbyMessageInclude,
  lobbyMessageOrderBy,
  NewDMMessage,
  NewLobbyMessage,
  GDPRLobbyMessage,
} from './types/chat.types';
import {
  DMChat,
  DMMessage,
  Friend,
  FriendStatus,
  LobbyBan,
  LobbyMessage,
  Prisma,
  Ranks,
} from 'src/generated/prisma/client';
import { ChatError } from './errors/chat.errors';
import { UserService } from '../user/user.service';
import { RelService } from '../relationships/rel.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly relService: RelService,
  ) {}

  async getDMId(sender: string, receiver: string): Promise<DMChat> {
    const sorted = await this.sortAndCheckUserIds(sender, receiver);
    try {
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
  ): Promise<DMHistory[number]> {
    await this.participantCheck(senderId, chatId);
    try {
      const raw = await this.prisma.dMMessage.create({
        data: { chatId, senderId, message },
        include: dMMessageInclude,
      });
      return {
        ...raw,
        sender: {
          ...raw.sender,
          avatar: raw.sender.avatar
            ? Buffer.from(raw.sender.avatar).toString('base64')
            : null,
        },
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.handleErrors(err);
      }
      throw err;
    }
  }

  async getDMHistory(userId: string, chatId: string): Promise<DMHistory> {
    await this.participantCheck(userId, chatId);
    const raw = await this.findDMMessages(chatId);
    return raw.map((message) => ({
      ...message,
      sender: {
        ...message.sender,
        avatar: message.sender.avatar
          ? Buffer.from(message.sender.avatar).toString('base64')
          : null,
      },
    }));
  }

  async saveLobbyMessage(
    senderId: string,
    message: string,
  ): Promise<LobbyHistory[number]> {
    await this.banCheck(senderId);
    try {
      const raw = await this.prisma.lobbyMessage.create({
        data: { senderId, message },
        include: lobbyMessageInclude,
      });
      return {
        ...raw,
        sender: raw.sender
          ? {
              ...raw.sender,
              avatar: raw.sender.avatar
                ? Buffer.from(raw.sender.avatar).toString('base64')
                : null,
            }
          : null,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.handleErrors(err);
      }
      throw err;
    }
  }

  async guestSaveLobbyMessage(message: string): Promise<LobbyHistory[number]> {
    return this.saveLobbyMessage('Guest', message);
  }

  async getLobbyHistory(): Promise<LobbyHistory> {
    const raw = await this.findLobbyMessages();
    return raw.map((message) => ({
      ...message,
      sender: message.sender
        ? {
            ...message.sender,
            avatar: message.sender.avatar
              ? Buffer.from(message.sender.avatar).toString('base64')
              : null,
          }
        : null,
    }));
  }

  // HELPER FUNCTIONS
  private async sortAndCheckUserIds(
    sender: string,
    receiver: string,
  ): Promise<DMParticipants> {
    const a = await this.userService.userExistsOrThrow(sender);
    const b = await this.userService.userExistsOrThrow(receiver);
    if (a.rank === Ranks.PENDING || b.rank === Ranks.PENDING) {
      throw new ForbiddenException(ChatError.WRONG_RANK);
    }
    const friendship = await this.findFriendship(sender, receiver);
    if (!friendship || !friendship.id) {
      throw new ForbiddenException(ChatError.NOT_FRIENDS);
    }
    if (sender < receiver) {
      return {
        userAId: sender,
        userBId: receiver,
        friendshipId: friendship.id,
      };
    }
    return { userAId: receiver, userBId: sender, friendshipId: friendship.id };
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

  private async participantCheck(
    userId: string,
    chatId: string,
  ): Promise<void> {
    const chat = await this.participantLookup(userId, chatId);
    if (!chat) {
      throw new ForbiddenException(ChatError.WRONG_CHAT);
    }
  }

  private async banCheck(userId: string): Promise<void> {
    const ban = await this.findBan(userId);
    if (ban) {
      throw new ForbiddenException(ChatError.BANNED);
    }
  }

  // GDPR MESSAGE HISTORY
  async fetchDMHistoryGDPR(userId: string): Promise<GDPRDMHistory> {
    const dms = await this.findAllDMChats(userId);
    return Promise.all(
      dms.map(async (dm) => {
        return {
          chatId: dm.id,
          userId: userId === dm.userAId ? dm.userBId : dm.userAId,
          messages: await this.gDPRDMMessages(dm.id),
        };
      }),
    );
  }

  async fetchLobbyHistoryGDPR(id: string): Promise<GDPRLobbyMessage[]> {
    return this.gDPRLobbyMessages(id);
  }

  // DB ACCESS
  private async findFriendship(
    sender: string,
    receiver: string,
  ): Promise<Friend | null> {
    return await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: sender, addresseeId: receiver },
          { requesterId: receiver, addresseeId: sender },
        ],
        status: FriendStatus.ACCEPTED,
      },
    });
  }

  private async createDMChat(users: DMParticipants): Promise<DMChat> {
    let chat = await this.prisma.dMChat.findFirst({
      where: { userAId: users.userAId, userBId: users.userBId },
    });
    if (!chat) {
      chat = await this.prisma.dMChat.create({
        data: users,
      });
    }
    return chat;
  }

  private async createDMMessage(data: NewDMMessage): Promise<DMMessage> {
    return await this.prisma.dMMessage.create({
      data: data,
    });
  }

  private async findAllDMChats(id: string): Promise<DMChat[]> {
    return this.prisma.dMChat.findMany({
      where: { OR: [{ userAId: id }, { userBId: id }] },
    });
  }

  private async findDMMessages(chatId: string): Promise<DMMessageRaw[]> {
    return await this.prisma.dMMessage.findMany({
      where: { chatId },
      include: dMMessageInclude,
      orderBy: dMMessageOrderBy,
    });
  }

  private async createLobbyMessage(
    data: NewLobbyMessage,
  ): Promise<LobbyMessage> {
    return await this.prisma.lobbyMessage.create({
      data: data,
    });
  }

  private async findLobbyMessages(): Promise<LobbyHistoryRaw> {
    return await this.prisma.lobbyMessage.findMany({
      include: lobbyMessageInclude,
      orderBy: lobbyMessageOrderBy,
    });
  }

  private async findBan(userId: string): Promise<LobbyBan | null> {
    return await this.prisma.lobbyBan.findUnique({
      where: { userId },
    });
  }

  private async participantLookup(
    userId: string,
    chatId: string,
  ): Promise<DMChat | null> {
    return await this.prisma.dMChat.findUnique({
      where: { id: chatId, OR: [{ userAId: userId }, { userBId: userId }] },
    });
  }

  private async gDPRDMMessages(chatId: string): Promise<GDPRDMMessage[]> {
    return await this.prisma.dMMessage.findMany({
      where: { chatId },
      select: gDPRDMessageSelect,
    });
  }

  private async gDPRLobbyMessages(
    senderId: string,
  ): Promise<GDPRLobbyMessage[]> {
    return await this.prisma.lobbyMessage.findMany({
      where: { senderId },
      select: gDPRLobbyMessageSelect,
    });
  }
}
