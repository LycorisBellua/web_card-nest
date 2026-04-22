import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'socket.io';
import {MessageBody, SubscribeMessage, WebSocketServer, WebSocketGateway} from '@nestjs/websockets';
import {RelService} from  '../../relationships/rel.service';

@WebSocketGateway()
export class WebsocketServer{
constructor(
    private readonly RelService: RelService,
  ) {}
@WebSocketServer()
server: Server;

@SubscribeMessage('FriendList')
async onNewMessage(@MessageBody() body: string)
{
    const friendlist = await this.RelService.fetchFriendsList(body);
    console.log("Websocket FriendList : ",friendlist);
    return friendlist;
}

}