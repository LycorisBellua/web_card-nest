import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('id/:sender/:receiver')
  async getChatId(
    @Param('sender') sender: string,
    @Param('receiver') receiver: string,
  ) {
    return this.chatService.getChatId(sender, receiver);
  }

  @Post()
  async saveMessage(
    @Body('chatId') chatId: string,
    @Body('senderId') senderId: string,
    @Body('message') message: string,
  ) {
    return this.chatService.saveMessage(chatId, senderId, message);
  }

  @Get('messages/:chatId')
  async getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getChatHistory(chatId);
  }
}
