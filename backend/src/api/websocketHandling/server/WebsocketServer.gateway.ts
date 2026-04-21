import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {MessageBody, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {RelService} from  '../../relationships/rel.service';

@WebSocketGateway()
export class WebsocketServer{
constructor(
    private readonly RelService: RelService,
  ) {}

@SubscribeMessage('FriendList')
onNewMessage(@MessageBody() body: string)
{
    const friendlist = this.RelService.fetchFriendsList(body);
    console.log(friendlist);
}



}