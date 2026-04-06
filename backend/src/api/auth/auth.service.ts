import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { SendMailService } from '../sendMail/sendMail.service';
import { EmailContents } from '../sendMail/messages/EmailContents';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sendMailService: SendMailService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const created = await this.userService.addUser(createUserDto);
    await this.sendVerificationEmail(created.id);
    return created;
  }

  async verifyEmail(userId: string, token: string) {
    const verified = await this.userService.verifyEmail(userId, token);
    if (!verified) {
      return { url: `${process.env.HOME_URL}/verify-error` };
    }
    return { url: `${process.env.HOME_URL}/verify-success` };
  }

  // Send Verification email (internal use)
  async sendVerificationEmail(userId: string) {
    const found = await this.userService.userExistsOrThrow(userId);
    const address = found.email_unverified;
    if (!address) {
      throw new BadRequestException('No email address to verify.');
    }
    let url = process.env.HOME_URL;
    if (url === undefined) {
      throw new BadRequestException('Unable to verify Card Nest URL');
    }
    url += '/api/auth/verify/' + userId + '/' + found.verifyToken;
    await this.sendMailService.sendMail(
      address,
      EmailContents.VER_OBJ,
      EmailContents.VER_MSG.replace('URL', url),
    );
  }
}
