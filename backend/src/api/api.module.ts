import { Module } from '@nestjs/common';
import { SendMailService } from './sendMail/sendMail.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserTasksService } from './user/user-tasks.service';
import { UserEmailsService } from './user/user-emails.service';
import { RelController } from './relationships/rel.controller';
import { RelService } from './relationships/rel.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { WebsocketServer } from './websocketHandling/WebsocketServer.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/jwt/auth.jwt-secret';
import { GdprController } from './gdpr/gdpr.controller';
import { GdprService } from './gdpr/gdpr.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { ChatService } from './chat/chat.service';
import { ConnectionRegistry } from './websocketHandling/registry/connection-registry';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [
    UserController,
    RelController,
    AuthController,
    GdprController,
    AdminController,
  ],
  providers: [
    SendMailService,
    UserService,
    UserTasksService,
    UserEmailsService,
    RelService,
    AuthService,
    GdprService,
    AdminService,
    ChatService,
    WebsocketServer,
    ConnectionRegistry,
  ],
})
export class ApiModule {}
