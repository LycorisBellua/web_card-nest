import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendMailService {
  async sendMail(email: string, object: string, message: string) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "no.rep.card.nest@gmail.com",
        pass: "wlxo qnvd ejsh mleq"
      },
    });
    const sender = {
      address: "no-reply@cardnest.com",
      name: "CardNest",
    };
    try
    {
      const info = await transporter.sendMail({
        from: sender,
        to: email,
        subject: object,
        text: message,
        html: `<b>${message}</b>`,

        // attachments: [
        // {
        //   filename: "image.webp",
        //   path: "/home/rothiery/Pictures/nanachi.webp"
        // }
  // ]
      });

      return info.messageId;
    }
    catch(err)
    {
      console.error("Error sending mail:", err);
      throw err;
    }
  }
}