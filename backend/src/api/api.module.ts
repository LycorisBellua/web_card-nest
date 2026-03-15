import { Module } from '@nestjs/common';
import { HelloController } from './hello/hello.controller';
import { HelloService } from './hello/hello.service';
import { SendMailController } from './sendMail/sendMail.controller';
import { SendMailService } from './sendMail/sendMail.service';


@Module({
  controllers: [HelloController, SendMailController],
  providers: [HelloService, SendMailService],
})
export class ApiModule {}
