import { Controller, Post, Body } from '@nestjs/common';
import { SendMailService } from './sendMail.service';

@Controller('api/sendMail')
export class SendMailController {
  constructor(private readonly sendMailService: SendMailService) {}

  @Post()
  async send(@Body() body: { email: string; object: string; message: string }) {
    const messageId = await this.sendMailService.sendMail(
      body.email,
      body.object,
      body.message,
    );
    return { success: true, messageId };
  }
}
