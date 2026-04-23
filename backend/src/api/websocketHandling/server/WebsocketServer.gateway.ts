import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketServer, WebSocketGateway,  OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import {RelService} from  '../../relationships/rel.service';

@Injectable()
@WebSocketGateway()
export class WebsocketServer implements OnGatewayConnection, OnGatewayDisconnect{
constructor(
    private readonly RelService: RelService,
  ) {}
@WebSocketServer()
server: Server;

  private connectedUsers = new Map<string, string>();

  handleConnection(client: Socket)
  {
    const userId = client.handshake.query.userId as string;
    if (userId)
    {
      this.connectedUsers.set(userId, client.id);
    }

  }

  handleDisconnect(client: Socket)
  {
    for (const [userId, socketId] of this.connectedUsers.entries())
    {
      if (socketId === client.id)
      {
        this.connectedUsers.delete(userId);
        break ;
      }

    }

  }
  @SubscribeMessage('sendMessage')
  SendMessageToTargetedSocket(@ConnectedSocket() Sender: Socket, @MessageBody() payload: {targetUserId:  string; message: string})
  {
    const ReceiverSocketId = this.connectedUsers.get(payload.targetUserId);

    if (ReceiverSocketId)
    {
      this.server.to(ReceiverSocketId).emit('receiveMessage', {
        from: Sender.id,
        message: payload.message,
      });
    }
  }  



@SubscribeMessage('FriendList')
async onNewMessage(@MessageBody() body: string,  @ConnectedSocket() socket: Socket)
{
    const friendlist = await this.RelService.fetchFriendsList(body);
    console.log("Websocket FriendList : ",friendlist);
    socket.emit('FriendList', friendlist);
    // return friendlist;
}

}