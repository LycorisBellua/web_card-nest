import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { RelService } from '../../relationships/rel.service';

@Injectable()
@WebSocketGateway()
export class WebsocketServer {
  constructor(private readonly RelService: RelService) {}
  @SubscribeMessage('FriendList')
  async GetFriendListRealTime(
    @MessageBody() body: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const friendlist = await this.RelService.fetchFriendsList(body);
    socket.emit('FriendList', friendlist);
  }

  @SubscribeMessage('BlockedList')
  async GetBlockedListRealTime(
    @MessageBody() body: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const Blockedlist = await this.RelService.fetchBlockedList(body);
    socket.emit('BlockedList', Blockedlist);
  }
}
