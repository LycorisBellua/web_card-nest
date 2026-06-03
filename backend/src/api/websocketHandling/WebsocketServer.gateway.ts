import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { RelService } from '../relationships/rel.service';
import { ChatService } from '../chat/chat.service';
import { DMHistory, LobbyHistory } from '../chat/types/chat.types';
import { UserProfile } from '../user/types/user.types';
import { DMChat } from 'src/generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';
import type { AppSocket } from './types/socket.types';
import { ConnectionRegistry } from './registry/connection-registry';
import { Ranks } from 'src/generated/prisma/enums';
import { send } from 'node:process';
import { UserService } from '../user/user.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.HOME_URL,
    credentials: true,
  },
})
export class WebsocketServer
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly connections: ConnectionRegistry,
    private readonly jwtService: JwtService,
    private readonly relService: RelService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  private readonly logger = new Logger(WebSocketServer.name);

  @WebSocketServer()
  server = new Server();

  async handleConnection(client: AppSocket): Promise<void> {
    const accessToken = client.handshake.auth?.accessToken as string;

    if (accessToken) {
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(accessToken);
        client.data.user = payload;
      } catch {
        client.disconnect();
        return;
      }
    } else {
      client.data.user = { id: 'Guest', rank: Ranks.PENDING } as JwtPayload;
    }

    const userId = client.data.user.id;
    console.log('User connected:', userId);

    if (userId === 'Guest') return;

    this.connections.add(userId, client.id);
    this.emitOnlineList(client);
  }

  async handleDisconnect(client: AppSocket): Promise<void> {
    const userId = this.connections.removeBySocketId(client.id);
    this.emitOnlineList(client);
  }

  async emitOnlineList(client: AppSocket): Promise<void> {
    if (client.data.user.id === 'Guest') {
      return;
    }
    const users = this.connections.getAllOnlineUsers();
    client.broadcast.emit('OnlineUsers', users);
  }

  @SubscribeMessage('FetchConvoHistory')
  async FetchConvoHistory(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() targetUserId: string,
  ): Promise<DMHistory> {
    const senderUserId = this.connections.getUserId(sender.id);
    if (!senderUserId || !targetUserId || senderUserId === 'Guest' || targetUserId === 'Guest') {
      return [];
    }
    const convoId = await this.chatService.getDMId(senderUserId, targetUserId);
    if (!convoId) return [];
    const convoHistory = await this.chatService.getDMHistory(
      senderUserId,
      convoId.id,
    );
    return convoHistory;
  }

  @SubscribeMessage('FetchLobbyHistory')
  async FetchLobbyHistory(): Promise<LobbyHistory> {
    return await this.chatService.getLobbyHistory();
  }

  @SubscribeMessage('PrivateMessage')
  async SendMessageToTargetedSocket(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() payload: { targetUserId: string; message: string },
  ): Promise<void> {
    if (sender.data.user.id === 'Guest') {
      return;
    }
    const receiverSocketId = this.connections.getSocketId(payload.targetUserId);
    const senderUserId = this.connections.getUserId(sender.id);
    let convoId: DMChat;

    this.logger.log('frontside userid : ', payload.targetUserId);
    this.logger.log('frontside socketid : ', receiverSocketId);
    if (!senderUserId) {
      return;
    }
    if (receiverSocketId) {
      try {
        convoId = await this.chatService.getDMId(
          senderUserId,
          payload.targetUserId,
        );

        await this.chatService.saveDM(
          convoId.id,
          senderUserId,
          payload.message,
        );
        this.server.to(receiverSocketId).emit('receiveMessage', {
          senderId: sender.id,
          message: payload.message,
        });
      } catch {
        return;
      }
    }
  }

  @SubscribeMessage('PublicMessage')
  async SendMessageToEveryBody(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() message: string,
  ): Promise<void> {
    const senderUserId = this.connections.getUserId(sender.id);
    if (!senderUserId) {
      return;
    }

    if (sender.data.user.id === 'Guest') {
      await this.chatService.guestSaveLobbyMessage(message);
      return;
    }
    await this.chatService.saveLobbyMessage(senderUserId, message);
    sender.broadcast.emit('PublicMessage', {
      sender: senderUserId,
      message: message,
    });
  }
}
