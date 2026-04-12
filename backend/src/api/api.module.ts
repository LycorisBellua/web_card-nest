import { Module } from '@nestjs/common';
import { HelloController } from './hello/hello.controller';
import { HelloService } from './hello/hello.service';
import { SendMailController } from './sendMail/sendMail.controller';
import { SendMailService } from './sendMail/sendMail.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { RelController } from './relationships/rel.controller';
import { RelService } from './relationships/rel.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { GdprController } from './gdpr/gdpr.controller';
import { GdprService } from './gdpr/gdpr.service';

@Module({ 
  controllers: [
    HelloController,
    SendMailController,
    UserController,
    RelController,
    AuthController,
    GdprController,
  ],
  providers: [
    HelloService,
    SendMailService,
    UserService,
    RelService,
    AuthService,
    GdprService,
  ],
})
export class ApiModule {}
