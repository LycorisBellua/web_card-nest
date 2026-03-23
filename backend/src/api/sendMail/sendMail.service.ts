import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

interface MailInfo {
  messageId: string;
}

@Injectable()
export class SendMailService {
  private readonly logger = new Logger(SendMailService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendMail(
    email: string,
    object: string,
    message: string,
  ): Promise<string> {
    const sender = {
      address: 'no-reply@cardnest.com',
      name: 'CardNest',
    };

    try {
      const info = (await this.transporter.sendMail({
        from: sender,
        to: email,
        subject: object,
        text: message,
        html: `<b>${message}</b>`,
        /*
        attachments: [
          {
            filename: 'test.svg',
            path: '/app/frontend/public/favicon.svg',
          },
        ],
        */
      })) as MailInfo;

      return info.messageId;
    } catch (err) {
      this.logger.error('Error sending mail:', err);
      throw err;
    }
  }
}
