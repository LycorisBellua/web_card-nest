import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from '../chat/chat.service';
import { DMHistory, LobbyHistory } from '../chat/types/chat.types';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';
import type { AppSocket } from './types/socket.types';
import { ConnectionRegistry } from './registry/connection-registry';
import { AdminService } from '../admin/admin.service';
import { UserService } from '../user/user.service';
import { Ranks } from 'src/generated/prisma/enums';

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
    private readonly connections: ConnectionRegistry,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  private readonly logger = new Logger(WebSocketServer.name);

  @WebSocketServer()
  server = new Server();

  async handleConnection(client: AppSocket): Promise<void> {
    const accessToken = client.handshake.auth?.accessToken as string;

    if (accessToken) {
      try {
        const payload =
          await this.jwtService.verifyAsync<JwtPayload>(accessToken);
        client.data.user = payload;
      } catch {
        client.disconnect();
        return;
      }
    } else {
      client.data.user = { id: 'Guest', rank: Ranks.PENDING };
    }

    const userId = client.data.user.id;
    if (userId === 'Guest') return;

    this.connections.add(userId, client.id);
    const users = this.connections.getAllUserIds();
    client.emit('OnlineUsers', users);
    client.broadcast.emit('OnlineUsers', users);
  }

  handleDisconnect(client: AppSocket): void {
    const userId = this.connections.removeBySocketId(client.id);
    if (!userId) return;
    const users = this.connections.getAllUserIds();
    client.broadcast.emit('OnlineUsers', users);
  }

  @SubscribeMessage('FetchConvoHistory')
  async FetchConvoHistory(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() targetUserId: string,
  ): Promise<DMHistory> {
    const senderUserId = this.connections.getUserId(sender.id);
    if (
      !senderUserId ||
      !targetUserId ||
      senderUserId === 'Guest' ||
      targetUserId === 'Guest'
    ) {
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
    if (sender.data.user.id === 'Guest') return;

    const senderUserId = this.connections.getUserId(sender.id);
    if (!senderUserId) return;

    const receiverSocketId = this.connections.getSocketId(payload.targetUserId);

    try {
      const convoId = await this.chatService.getDMId(
        senderUserId,
        payload.targetUserId,
      );
      const full = await this.chatService.saveDM(
        convoId.id,
        senderUserId,
        payload.message,
      );

      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('receiveMessage', full);
      }
      sender.emit('receiveMessage', full);
    } catch {
      return;
    }
  }

  @SubscribeMessage('PublicMessage')
  async SendMessageToEveryBody(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() message: string,
  ): Promise<void> {
    const isGuest = sender.data.user.id === 'Guest';
    if (isGuest) {
      const full = await this.chatService.guestSaveLobbyMessage(message);
      this.server.emit('PublicMessage', full);
      return;
    }

    const senderUserId = this.connections.getUserId(sender.id);
    if (!senderUserId) {
      return;
    }
    const full = await this.chatService.saveLobbyMessage(senderUserId, message);
    this.server.emit('PublicMessage', full);
  }

  @SubscribeMessage('ModerateLobbyMessage')
  async ModerateLobbyMessage(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() messageId: string,
  ): Promise<void> {
    const user = sender.data.user;
    if (user.rank !== Ranks.MODERATOR && user.rank !== Ranks.ADMIN) {
      return;
    }
    try {
      const updated = await this.adminService.moderateLobbyMessage(
        user.id,
        user.rank,
        messageId,
      );
      this.server.emit('messageModerated', { messageId: updated.id });
    } catch {
      return;
    }
  }

  pushLobbyTimeoutStatus(userId: string, isBanned: boolean): void {
    if (userId === 'Guest') {
      this.server.emit('LobbyTimeoutStatus', { isBanned, isGuest: true });
      return;
    }
    const socketId = this.connections.getSocketId(userId);
    if (socketId) {
      this.server
        .to(socketId)
        .emit('LobbyTimeoutStatus', { isBanned, isGuest: false });
    }
  }

  @SubscribeMessage('GetSelfLobbyTimeoutStatus')
  async GetSelfLobbyTimeoutStatus(
    @ConnectedSocket() sender: AppSocket,
  ): Promise<boolean> {
    try {
      const userId = sender.data.user.id;
      if (userId !== 'Guest' && !this.connections.getUserId(sender.id)) {
        return false;
      }
      const obj = await this.userService.findLobbyBan(userId);
      return obj !== null;
    } catch {
      return false;
    }
  }
}
