import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  DMChatId,
  DMHistory,
  DMMessageId,
  LobbyHistory,
  LobbyMessageId,
} from './types/chat.types';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('id/:sender/:receiver')
  async getDMId(
    @Param('sender') sender: string,
    @Param('receiver') receiver: string,
  ): Promise<DMChatId> {
    return await this.chatService.getDMId(sender, receiver);
  }

  @Post('dm')
  async saveDM(
    @Body('chatId') chatId: string,
    @Body('senderId') senderId: string,
    @Body('message') message: string,
  ): Promise<DMMessageId> {
    return await this.chatService.saveDM(chatId, senderId, message);
  }

  @Get('dm/:chatId/:userId')
  async getDMHistory(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<DMHistory> {
    return await this.chatService.getDMHistory(userId, chatId);
  }

  @Post('lobby')
  async saveLobbyMessage(
    @Body('senderId') senderId: string,
    @Body('message') message: string,
  ): Promise<LobbyMessageId> {
    return await this.chatService.saveLobbyMessage(senderId, message);
  }

  @Get('lobby')
  async getLobbyHistory(): Promise<LobbyHistory> {
    return await this.chatService.getLobbyHistory();
  }
}
