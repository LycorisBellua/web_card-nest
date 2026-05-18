import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compareHash, getCurrentTime } from '../user/utils/user.utils';
import { JwtPayload } from './jwt/auth.jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.userService.addUser(createUserDto);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ refreshToken: string; timeout: Date; accessToken: string }> {
    const found = await this.userService.userExistsByEmail(email);
    if (
      !found ||
      (found.email && found.email !== email) ||
      !(await compareHash(password, found.password))
    ) {
      throw new UnauthorizedException('Email address or password incorrect.');
    }
    const refresh = await this.userService.generateRefreshToken(found.id);
    const access = await this.generateJwtToken(found.id);
    return {
      refreshToken: refresh.token,
      timeout: refresh.timeout,
      accessToken: access,
    };
  }

  async logout(userId: string) {
    return await this.userService.removeRefreshToken(userId);
  }

  async refresh(jwtToken: string, refreshToken: string) {
    const payload: JwtPayload = this.jwtService.decode(jwtToken);
    if (!payload) {
      throw new UnauthorizedException();
    }
    const found = await this.userService.userExistsOrThrow(payload.id);
    if (
      !found.refreshToken ||
      !found.refreshTimeout ||
      found.refreshTimeout < getCurrentTime() ||
      !(await compareHash(refreshToken, found.refreshToken))
    ) {
      throw new UnauthorizedException();
    }
    return await this.generateJwtToken(payload.id);
  }

  async verifyEmail(userId: string, token: string) {
    const verified = await this.userService.verifyEmail(userId, token);
    if (!verified) {
      return { url: `${process.env.HOME_URL}/verify-error` };
    }
    return { url: `${process.env.HOME_URL}/verify-success` };
  }

  async cancelVerification(userId: string, token: string) {
    return await this.userService.cancelVerification(userId, token);
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
