import { Injectable, OnModuleInit, OnModuleDestroy, Logger, BadRequestException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketServer, WebSocketGateway,  OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import {RelService} from  '../relationships/rel.service';
import { UserService } from 'src/api/user/user.service';
@Injectable()
@WebSocketGateway( {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class WebsocketServer implements OnGatewayConnection, OnGatewayDisconnect{
constructor(
  
   private readonly RelService: RelService,
   public prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(WebSocketServer.name);
  @WebSocketServer()
  server = new Server();
  public connectedUsersId = new Map<string, string>();
  public  connectedUsersSocketId = new Map<string, string>();
  public  BlockedUsersId = new Map<string, string>();
  

  async handleConnection(client: Socket)
  {
    const userId = client.handshake.query.userId as string;
    let friendlist;
    if (!userId)
      return ;
    this.connectedUsersId.set(userId, client.id);
    this.connectedUsersSocketId.set(client.id, userId);
    friendlist = await this.RelService.fetchFriends(userId);
    this.emitFriendList(userId);
    this.UpdateFriendsFriendList(friendlist);
  }

  async UpdateFriendsFriendList(Friends: any[])
  {
    let FriendList;
    for (const friend of Friends) 
    {
      if (this.connectedUsersId.has(friend.id)) 
      {  
        await this.emitFriendList(friend.id);
      } 
    }
  }

  async handleDisconnect(client: Socket)
  {
    const userId = this.connectedUsersSocketId.get(client.id) as string;
    this.connectedUsersId.delete(userId);
    this.connectedUsersSocketId.delete(userId);
    const friendlist = await this.RelService.fetchFriends(userId);
    this.UpdateFriendsFriendList(friendlist);
    if (this.BlockedUsersId.has(userId))
      this.BlockedUsersId.delete(userId);
    console.log("Disconnect");
  }

  async emitFriendList(@MessageBody() TargetUserId: string)
  {
    const socketId = this.connectedUsersId.get(TargetUserId);
    const Friends = await this.RelService.fetchFriends(TargetUserId);
    const connected : any[] = [];
    const disconnected:  any[]= [];
    if (!socketId)
        return ;
    for (const friend of Friends) 
    {
        if (this.connectedUsersId.has(friend.id)) 
        {
            connected.push(friend);
        } 
        else 
        {
            disconnected.push(friend);
        }
        this.server.to(socketId).emit('FriendListConnected', connected);
        console.log("connected = ", connected);
        this.server.to(socketId).emit('FriendListDisconnected', disconnected);
        console.log("disconnected = ", disconnected);
    }
  }


  @SubscribeMessage('RefreshFriendFriendList')
  async RefereshRefreshFriendFriendList(@MessageBody() userId: string)
  {
    const Friends = await this.RelService.fetchFriends(userId);
    await this.UpdateFriendsFriendList(Friends);
  }

  @SubscribeMessage('UpdateFriendList')
  async emitFriendListToAllId(@MessageBody() Users: string[])
  {
    for (const user in Users)
    {
     await this.emitFriendList(user);
    }
  }

  
  @SubscribeMessage('PrivateMessage')
  SendMessageToTargetedSocket(@ConnectedSocket() Sender: Socket, @MessageBody() payload: {targetUserId:  string; message: string})
  {
    const ReceiverSocketId = this.connectedUsersId.get(payload.targetUserId);
    const SenderUserId = this.connectedUsersSocketId.get(Sender.id);
    this.logger.log("frontside userid : ", payload.targetUserId);
    this.logger.log("frontside socketid : ", ReceiverSocketId);
    if (SenderUserId && this.BlockedUsersId.has(SenderUserId))
      return ;
    if (ReceiverSocketId)
    {
     
        this.server.to(ReceiverSocketId).emit('receiveMessage', 
        {
        Sender: Sender.id,
        message: payload.message,
        
      } 
    );
    }
  }
  
  @SubscribeMessage('PublicMessage')
  SendMessageToEveryBody(@ConnectedSocket() Sender: Socket, @MessageBody()  message: string)
  {
    const SenderUserId = this.connectedUsersSocketId.get(Sender.id);
    if (SenderUserId && this.BlockedUsersId.has(SenderUserId))
      return ;
    Sender.broadcast.emit('PublicMessage', {
      Sender: SenderUserId,
      message: message});
  }
}