import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
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
import { GameRegistry } from '../game/registry/game.registry';
import { Game, Occupant } from '../game/types/game.types';

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
    private readonly games: GameRegistry,
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

    const oldSocket = this.connections.add(userId, client.id);
    if (oldSocket) {
      this.server.sockets.sockets.get(oldSocket)?.disconnect(true);
    }
    this.reconnectGame(userId, client);
    const users = this.connections.getAllUserIds();
    client.emit('OnlineUsers', users);
    client.broadcast.emit('OnlineUsers', users);
  }

  handleDisconnect(client: AppSocket): void {
    const userId = this.connections.removeBySocketId(client.id);
    if (!userId) return;
    this.disconnectGame(userId);
    const users = this.connections.getAllUserIds();
    client.broadcast.emit('OnlineUsers', users);
  }

  // ********** CHAT / LOBBY HANDLING **********

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

  // ********** GAME HANDLING **********

  @SubscribeMessage('CreateGame')
  createGame(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() payload: { seats: number },
  ): void {
    try {
      const game = this.games.createGame({
        userId: sender.data.user.id,
        seats: payload.seats,
      });
      sender.emit('GameInfo', this.toWire(game));
    } catch (err) {
      sender.emit('GameError', this.errorHandler(err));
    }
  }

  @SubscribeMessage('JoinGame')
  joinGame(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() payload: { gameId: string },
  ): void {
    try {
      const game = this.games.joinGame({
        joinerId: sender.data.user.id,
        gameId: payload.gameId,
      });
      this.broadcastGameInfo(game);
    } catch (err) {
      sender.emit('GameError', this.errorHandler(err));
    }
  }

  @SubscribeMessage('LeaveGame')
  leaveGame(@ConnectedSocket() sender: AppSocket): void {
    try {
      const game = this.games.leaveGame({
        userId: sender.data.user.id,
      });
      this.broadcastGameInfo(game);
    } catch (err) {
      sender.emit('GameError', this.errorHandler(err));
    }
  }

  private reconnectGame(userId: string, client: AppSocket): void {
    try {
      const game = this.games.reconnect(userId);
      this.broadcastGameInfo(game);
    } catch (err) {
      if (err instanceof ForbiddenException) {
        client.emit('GameError', this.errorHandler(err));
      }
    }
  }

  private disconnectGame(userId: string): void {
    const game = this.games.disconnect(userId);
    if (game) {
      this.broadcastGameInfo(game);
    }
  }

  @SubscribeMessage('InviteGame')
  inviteToGame(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() payload: { gameId: string; invitedId: string },
  ): void {
    try {
      const socket = this.connections.getSocketId(payload.invitedId);
      if (!socket) {
        throw new BadRequestException('The user is offline or does not exist.');
      }
      const game = this.games.inviteToGame({
        leaderId: sender.data.user.id,
        gameId: payload.gameId,
        invitedId: payload.invitedId,
      });
      this.server.to(socket).emit('GameInvite', payload.gameId);
      this.broadcastGameInfo(game);
    } catch (err) {
      sender.emit('GameError', this.errorHandler(err));
    }
  }

  @SubscribeMessage('RejectGame')
  rejectInvite(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() payload: { gameId: string },
  ): void {
    try {
      const game = this.games.rejectInvite({
        joinerId: sender.data.user.id,
        gameId: payload.gameId,
      });
      this.broadcastGameInfo(game);
      const leaderSocket = this.connections.getSocketId(game.leader);
      if (leaderSocket) {
        this.server.to(leaderSocket).emit('GameRejected', {
          gameId: game.gameId,
          invitedId: sender.data.user.id,
        });
      }
    } catch (err) {
      sender.emit('GameError', this.errorHandler(err));
    }
  }

  @SubscribeMessage('SyncGame')
  syncGameState(
    @ConnectedSocket() sender: AppSocket,
    @MessageBody() payload: unknown,
  ): void {
    const senderId = sender.data.user.id;
    let players: Occupant[];
    try {
      players = this.games.syncGameState(senderId);
    } catch (err) {
      sender.emit('GameError', this.errorHandler(err));
      return;
    }
    for (const player of players) {
      if (player.type === 'human' && player.id !== senderId) {
        const socket = this.connections.getSocketId(player.id);
        if (socket) {
          this.server.to(socket).emit('GameState', payload);
        }
      }
    }
  }

  private broadcastGameInfo(game: Game) {
    for (const player of game.players) {
      if (player.type === 'human') {
        const socket = this.connections.getSocketId(player.id);
        if (socket) {
          this.server.to(socket).emit('GameInfo', this.toWire(game));
        }
      }
    }
  }

  private toWire(game: Game) {
    return { ...game, invited: [...game.invited] };
  }

  private errorHandler(err: unknown): string {
    return err instanceof HttpException ? err.message : 'Unexpected Error';
  }
}
