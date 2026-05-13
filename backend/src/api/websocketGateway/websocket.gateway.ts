import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
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
    // private readonly UserService: UserService,
  ) {}
  private readonly logger = new Logger(WebSocketServer.name);
  @WebSocketServer()
  server = new Server();

  public connectedUsersId = new Map<string, string>();
  public  connectedUsersSocketId = new Map<string, string>();
  // private ConnectedUsersFriendList = new Map<string, any>();
  

  // getUserSocketFriendList(userId: string) 
  // {
  //   return this.ConnectedUsersFriendList.get(userId);
  // // }

  // UpdateFriendListOnEvent(userId: string, friends: any)
  // {
  //   friends.map(friend => {
  //     if(this.connectedUsersId.has(friend.id))
  //       this.server.to(friend.id).emit(EventName, userId);
  //   }) 
  // }

  
  async handleConnection(client: Socket)
  {
    const userId = client.handshake.query.userId as string;
    if (userId)
      return ;
    this.connectedUsersId.set(userId, client.id);
    this.connectedUsersId.set(client.id, userId);
    const friendlist = await this.RelService.fetchFriendsList(userId);
    this.emitFriendList({TargetUserId: userId, Friends: friendlist.FriendsList })
    // this.warnFriendOnEvent('FriendlistUpdatedNewConnection', userId, friendlist);
    // this.ConnectedUsersFriendList.set(userId, client.id);
  }

  async handleDisconnect(client: Socket)
  {
    const userId = this.connectedUsersSocketId.get(client.id) as string;
    // this.warnFriendOnEvent('FriendListUpdatedDisconnection', userId, this.ConnectedUsersFriendList.get(userId))
    this.connectedUsersId.delete(userId);
    this.connectedUsersSocketId.delete(userId);
    // this.ConnectedUsersFriendList.delete(userId);
  }


  // @SubscribeMessage('receiveMessage')
  // ReceiveMessageFromTargetedSocket(@ConnectedSocket() Receiver: Socket, @MessageBody() payload: {Sender:  string; message: string})
  // {
  //   const chatMessage = payload.Sender + ":" + payload.message as string;
  //   Receiver.emit('receiveMessage', chatMessage);

  // }
  // removeFriendFromFriendList(userId: string, IdtoRemove: string)
  // {
  //   const FriendList = this.ConnectedUsersFriendList.get(userId);
  //   const updated = FriendList.filter(id => id !==  IdtoRemove);
  //   this.ConnectedUsersFriendList.set(userId, updated);
  // }
  // async addFriendFromFriendList(userId: string, IdtoAdd: string)
  // {
  //   const FriendList = this.ConnectedUsersFriendList.get(userId);
  //   const newFriend = await this.UserService.getUsernameById(IdtoAdd);
  //   if (!newFriend)
  //       return ;
  //     FriendList.push(...newFriend);
  //   this.ConnectedUsersFriendList.set(userId, FriendList);
  // }

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
        this.server.to(socketId).emit('FriendList', {connected, disconnected });
    }
   }

//   @SubscribeMessage('IsConnected')
//   IsConnected(@MessageBody() friendId: string)
//   {
//     if (this.connectedUsersId.has(friendId))
//       return (true);
//     return (false);
//   }

  // @SubscribeMessage('FriendListUpdateDeletedUser')
  // RemoveDeletedUser(@ConnectedSocket() Client: Socket, @MessageBody() userIdtoRemove: string)
  // {
  //   const userId = this.connectedUsersSocketId.get(Client.id) as string;
  //   if (!userId)
  //       return ;
  //   this.removeFriendFromFriendList(userId,userIdtoRemove);
  // }
  
  @SubscribeMessage('PrivateMessage')
  SendMessageToTargetedSocket(@ConnectedSocket() Sender: Socket, @MessageBody() payload: {targetUserId:  string; message: string})
  {
    const ReceiverSocketId = this.connectedUsersId.get(payload.targetUserId);
    this.logger.log("frontside userid : ", payload.targetUserId);
    this.logger.log("frontside socketid : ", ReceiverSocketId);
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

  // @SubscribeMessage('FriendList')
  // onNewMessage(@ConnectedSocket() socket: Socket)
  // { 
  //   // const userId = this.connectedUsersSocketId.get(socket.id);
  //   // if (!userId)
  //   //   return ;
  //   // const friendList = this.ConnectedUsersFriendList.get(userId);  
  //   // if (!friendList)
  //   //   return ;
  //   // console.log("Websocket FriendList : ",friendList);
  //   // socket.emit('FriendList', friendList);
  //   // // return friendlist;
  // }

//   @SubscribeMessage('BlockedList')
//   async GetBlockedListRealTime(@MessageBody() body: string,  @ConnectedSocket() socket: Socket)
//   {
//     const userId = this.connectedUsersSocketId.get(socket.id);
//     if (!userId)
//         return ;
//     const Blockedlist = await this.RelService.fetchBlockedList(userId);
//     if (!Blockedlist)
//         return ;
//     socket.emit('BlockedList', Blockedlist);
//   }


}