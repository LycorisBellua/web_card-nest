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
    private readonly chatService: ChatService,
  ) {}

  private readonly logger = new Logger(WebSocketServer.name);

  @WebSocketServer()
  server = new Server();

  async handleConnection(client: AppSocket): Promise<void> {
    try {
      const accessToken = client.handshake.auth?.accessToken as string;
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(accessToken);
      client.data.user = payload;
    } catch {
      client.disconnect();
    }
    const userId = client.data.user.id;
    this.connections.add(client.data.user.id, client.id);
    const friendlist = await this.relService.fetchFriends(userId);
    await this.emitFriendList(userId);
    await this.updateFriendsFriendList(friendlist);
  }

  async updateFriendsFriendList(Friends: UserProfile[]): Promise<void> {
    for (const friend of Friends) {
      if (this.connections.isOnline(friend.id)) {
        await this.emitFriendList(friend.id);
      }
    }
  }

  async handleDisconnect(client: AppSocket): Promise<void> {
    const userId = this.connections.removeBySocketId(client.id);
    if (!userId) {
      return;
    }
    const friendlist = await this.relService.fetchFriends(userId);
    await this.updateFriendsFriendList(friendlist);
  }

  async emitFriendList(@MessageBody() targetUserId: string): Promise<void> {
    const socketId = this.connections.getSocketId(targetUserId);
    const friends = await this.relService.fetchFriends(targetUserId);
    const connected: UserProfile[] = [];
    const disconnected: UserProfile[] = [];
    if (!socketId) return;
    for (const friend of friends) {
      if (this.connections.isOnline(friend.id)) {
        connected.push(friend);
      } else {
        disconnected.push(friend);
      }
      this.server.to(socketId).emit('FriendListConnected', connected);
      this.server.to(socketId).emit('FriendListDisconnected', disconnected);
    }
  }

  @SubscribeMessage('RefreshFriendFriendList')
  async RefereshRefreshFriendFriendList(
    @MessageBody() userId: string,
  ): Promise<void> {
    const friends = await this.relService.fetchFriends(userId);
    await this.updateFriendsFriendList(friends);
  }

  @SubscribeMessage('UpdateFriendList')
  async emitFriendListToAllId(@MessageBody() users: string[]): Promise<void> {
    await Promise.all(users.map((user) => this.emitFriendList(user)));
  }

  @SubscribeMessage('FetchConvoHistory')
  async FetchConvoHistory(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() targetUserId: string,
  ): Promise<DMHistory> {
    const senderUserId = this.connections.getUserId(sender.id);
    if (!senderUserId || !targetUserId) {
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

    await this.chatService.saveLobbyMessage(senderUserId, message);
    sender.broadcast.emit('PublicMessage', {
      sender: senderUserId,
      message: message,
    });
  }
}
