import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('id/:sender/:receiver')
  async getDMId(
    @Param('sender') sender: string,
    @Param('receiver') receiver: string,
  ) {
    return await this.chatService.getDMId(sender, receiver);
  }

  @Post('dm')
  async saveDM(
    @Body('chatId') chatId: string,
    @Body('senderId') senderId: string,
    @Body('message') message: string,
  ) {
    return await this.chatService.saveDM(chatId, senderId, message);
  }

  @Get('dm/:chatId/:userId')
  async getDMHistory(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return await this.chatService.getDMHistory(userId, chatId);
  }

  @Post('lobby')
  async saveLobbyMessage(
    @Body('senderId') senderId: string,
    @Body('message') message: string,
  ) {
    return await this.chatService.saveLobbyMessage(senderId, message);
  }

  @Get('lobby')
  async getLobbyHistory() {
    return await this.chatService.getLobbyHistory();
  }
}
