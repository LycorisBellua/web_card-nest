import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { getToken } from '../user/utils/user.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.userService.addUser(createUserDto);
  }

  async verifyEmail(userId: string, token: string) {
    const verified = await this.userService.verifyEmail(userId, token);
    if (!verified) {
      return { url: `${process.env.HOME_URL}/verify-error` };
    }
    return { url: `${process.env.HOME_URL}/verify-success` };
  }

  async resendVerificationEmail(userId: string) {
    return await this.userService.resendVerificationEmail(userId);
  }

  // Generate JWT
  async generateJwtToken(userId: string) {
    const user = await this.userService.userExistsOrThrow(userId);
    const payload = {
      id: userId,
      rank: user.rank,
    };
    return await this.jwtService.signAsync(payload);
  }
}
