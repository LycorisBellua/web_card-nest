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
    //  private readonly RelService: RelService,
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
    friendlist = await this.fetchFriendsList(userId);
    this.emitFriendList({TargetUserId: userId, Friends: friendlist.FriendsList })
    this.WarnFriendOnConnection( userId, friendlist.FriendsList);
  }

  async WarnFriendOnConnection(NewConnectedId: string, Friends: any[])
  {
    let FriendList;
    for (const friend of Friends) 
    {
      if (this.connectedUsersId.has(friend.id)) 
      {
        FriendList = await this.fetchFriendsList(friend.id);  
        this.emitFriendList({TargetUserId: friend.id, Friends: FriendList.FriendsList});
      } 
    }
  }

  async handleDisconnect(client: Socket)
  {
    const userId = this.connectedUsersSocketId.get(client.id) as string;
    this.connectedUsersId.delete(userId);
    this.connectedUsersSocketId.delete(userId);
    const friendlist = await this.fetchFriendsList(userId);
    this.WarnFriendOnConnection( userId, friendlist.FriendsList);
    if (this.BlockedUsersId.has(userId))
      this.BlockedUsersId.delete(userId);
    console.log("Disconnect");
  }

  async findAccepted(originId: string) {
    return await this.prisma.friend.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: originId }, { addresseeId: originId }],
      },
    });
  }

  async fetchFriends(originId: string) 
  {
    await this.userExistsOrThrow(originId);
    return await this.findAccepted(originId);
  }

  async fetchFriendsList(originId: string) 
  {
    
    const RawData = await this.fetchFriends(originId);
    const FriendIdList = RawData.map(item => item.requesterId !== originId ? item.requesterId : item.addresseeId);
    const FriendsList = await Promise.all(FriendIdList.map(item => this.getUsernameById(item)));
    return {FriendsList};
  }
  
  async userExistsOrThrow(toFind: string) 
  {
    const found = await this.prisma.user.findUnique({
      where: { id: toFind },
      select: {
        email: true,
        email_unverified: true,
        rank: true,
        password: true,
        username: true,
        verifyToken: true,
        verifyTimeout: true,
        refreshToken: true,
        refreshTimeout: true,
      },
    });
    if (!found) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }
    return found;
  }
  
  async getUsernameById(toFind: string) 
  {
      const found = await this.prisma.user.findUnique({
        where: { id: toFind },
        select: {
          username: true,
          id: true,
        },
      });
      if (!found) {
        throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
      }
      return { ...found };
  }

  emitFriendList(@MessageBody() payload: {TargetUserId: string; Friends: any[]})
  {
    const socketId = this.connectedUsersId.get(payload.TargetUserId);
    const connected : any[] = [];
    const disconnected:  any[]= [];
    if (!socketId)
        return ;
    for (const friend of payload.Friends) 
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


  // @SubscribeMessage('BlockUser')
  // BlockMessage(@MessageBody() targetUserid: string)
  // {
  //   let BlockedSocketId;
    
  //   if (!this.connectedUsersId.has(targetUserid))
  //   {
  //     BlockedSocketId = this.connectedUsersId.get(targetUserid);
  //     this.BlockedUsersId.set(targetUserid, BlockedSocketId);
  //   }
  // }

  // @SubscribeMessage('UnblockUser')
  // UnblockMessage(@MessageBody() targetUserid: string)
  // {  
  //   if (this.BlockedUsersId.has(targetUserid))
  //     this.BlockedUsersId.delete(targetUserid);
  // }



  
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