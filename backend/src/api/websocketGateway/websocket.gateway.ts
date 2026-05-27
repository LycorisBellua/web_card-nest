import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
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
import { UserService } from 'src/api/user/user.service';
import { ChatService } from '../chat/chat.service';
import { FriendUser } from '../relationships/types/rel.types';
import { MessageHistory } from '../chat/types/chat.types';




@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class WebsocketServer
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly RelService: RelService,
    public prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}
  private readonly logger = new Logger(WebSocketServer.name);
  @WebSocketServer()
  server = new Server();
  public connectedUsersId = new Map<string, string>();
  public connectedUsersSocketId = new Map<string, string>();
  public BlockedUsersId = new Map<string, string>();

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;
    this.connectedUsersId.set(userId, client.id);
    this.connectedUsersSocketId.set(client.id, userId);
    const friendlist = await this.RelService.fetchFriends(userId);
    await this.emitFriendList(userId);
    await this.UpdateFriendsFriendList(friendlist);
  }

  async UpdateFriendsFriendList(Friends: FriendUser[]) {
    for (const friend of Friends) {
      if (this.connectedUsersId.has(friend.id)) {
        await this.emitFriendList(friend.id);
      }
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsersSocketId.get(client.id) as string;
    this.connectedUsersId.delete(client.id);
    this.connectedUsersSocketId.delete(userId);
    const friendlist = await this.RelService.fetchFriends(userId);
    await this.UpdateFriendsFriendList(friendlist);
    if (this.BlockedUsersId.has(userId)) this.BlockedUsersId.delete(userId);
    console.log('Disconnect');
  }

  async emitFriendList(@MessageBody() TargetUserId: string) {
    const socketId = this.connectedUsersId.get(TargetUserId);
    const Friends = await this.RelService.fetchFriends(TargetUserId);
    const connected: FriendUser[] = [];
    const disconnected: FriendUser[] = [];
    if (!socketId) return;
    for (const friend of Friends) {
      if (this.connectedUsersId.has(friend.id)) {
        connected.push(friend);
      } else {
        disconnected.push(friend);
      }
      this.server.to(socketId).emit('FriendListConnected', connected);
      console.log('connected = ', connected);
      this.server.to(socketId).emit('FriendListDisconnected', disconnected);
      console.log('disconnected = ', disconnected);
    }
  }

  @SubscribeMessage('RefreshFriendFriendList')
  async RefereshRefreshFriendFriendList(@MessageBody() userId: string) {
    const Friends = await this.RelService.fetchFriends(userId);
    await this.UpdateFriendsFriendList(Friends);
  }

  @SubscribeMessage('UpdateFriendList')
  async emitFriendListToAllId(@MessageBody() Users: string[]) {
    await Promise.all(Users.map((user) => this.emitFriendList(user)));
  }

  @SubscribeMessage('FetchConvoHistory')
  async FetchConvoHistory(
    @ConnectedSocket() Sender: Socket,
    @MessageBody() targetUserId: string,
  ): Promise<any>   {
    const SenderUserId = this.connectedUsersSocketId.get(Sender.id);
    console.log("senderId : ", SenderUserId);
    console.log("TargetId : ", targetUserId);
    if (!SenderUserId || !targetUserId) return [];
    const ConvoId = await this.chatService.getChatId(
      SenderUserId,
      targetUserId,
    );
        console.log("CovoId : ", ConvoId);
    if (!ConvoId) return [];
    const Convo = await this.chatService.getMessages(ConvoId);
    console.log("Convo : " ,  Convo);
    return Convo;
  }

  @SubscribeMessage('PrivateMessage')
  async SendMessageToTargetedSocket(
    @ConnectedSocket() Sender: Socket,
    @MessageBody() payload: { targetUserId: string; message: string },
  ) {
    const ReceiverSocketId = this.connectedUsersId.get(payload.targetUserId);
    const SenderUserId = this.connectedUsersSocketId.get(Sender.id);
    let ConvoId: string;

    this.logger.log('frontside userid : ', payload.targetUserId);
    this.logger.log('frontside socketid : ', ReceiverSocketId);
    if (!SenderUserId) return;
    if (ReceiverSocketId) {
      try {
        ConvoId = await this.chatService.getChatId(
          SenderUserId,
          payload.targetUserId,
        );

        if (SenderUserId && this.BlockedUsersId.has(SenderUserId)) return;

        await this.chatService.saveMessage(
          ConvoId,
          SenderUserId,
          payload.message,
        );
        this.server.to(ReceiverSocketId).emit('receiveMessage', {
          senderId: Sender.id,
          message: payload.message,
        });
      } catch {
        return;
      }
    }
  }

  @SubscribeMessage('PublicMessage')
  SendMessageToEveryBody(
    @ConnectedSocket() Sender: Socket,
    @MessageBody() message: string,
  ) {
    const SenderUserId = this.connectedUsersSocketId.get(Sender.id);
    if (SenderUserId && this.BlockedUsersId.has(SenderUserId)) return;
    Sender.broadcast.emit('PublicMessage', {
      Sender: SenderUserId,
      message: message,
    });
  }
}
