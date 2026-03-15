import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendMailService {
  async sendMail(email: string, object: string, message: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    const sender = {
      address: 'no-reply@cardnest.com',
      name: 'CardNest',
    };
    try {
      const info = await transporter.sendMail({
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
      });

      return info.messageId;
    } catch (err) {
      console.error('Error sending mail:', err);
      throw err;
    }
  }
}
