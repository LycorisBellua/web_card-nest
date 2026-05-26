import { Module } from '@nestjs/common';
import { HelloController } from './hello/hello.controller';
import { HelloService } from './hello/hello.service';
import { SendMailController } from './sendMail/sendMail.controller';
import { SendMailService } from './sendMail/sendMail.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserTasksService } from './user/user-tasks.service';
import { UserEmailsService } from './user/user-emails.service';
import { RelController } from './relationships/rel.controller';
import { RelService } from './relationships/rel.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { WebsocketServer } from './websocketHandling/server/WebsocketServer.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/jwt/auth.jwt-secret';
import { GdprController } from './gdpr/gdpr.controller';
import { GdprService } from './gdpr/gdpr.service';
import { PasswordResetController } from './auth/password-reset.controller';
import { PasswordResetService } from './auth/password-reset.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [
    HelloController,
    SendMailController,
    UserController,
    RelController,
    AuthController,
    GdprController,
    PasswordResetController,
    AdminController,
  ],
  providers: [
    HelloService,
    SendMailService,
    UserService,
    UserTasksService,
    UserEmailsService,
    RelService,
    AuthService,
    GdprService,
    PasswordResetService,
    AdminService,
  ],
})
export class ApiModule {}