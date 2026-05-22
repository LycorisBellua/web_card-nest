import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import {
  comparePasswordHash,
  createTokenHash,
  getCurrentTime,
  getRefreshTimeout,
  getToken,
} from '../user/utils/user.utils';
import { JwtPayload } from './jwt/auth.jwt-payload';
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { TokenPair } from './jwt/auth.token-pair';
import { Ranks } from 'src/generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.userService.addUser(createUserDto);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const found = await this.userService.userExistsByEmail(email);
    if (
      !found ||
      (found.email && found.email !== email) ||
      !(await comparePasswordHash(password, found.password))
    ) {
      throw new UnauthorizedException('Email address or password incorrect.');
    }
    return this.generateTokenPair(found.id, found.rank);
  }

  async logout(userId: string) {
    return await this.userService.removeRefreshToken(userId);
  }

  async refresh(refreshToken: string): Promise<string> {
    const hash = createTokenHash(refreshToken);
    const user = await this.userService.userExistsByRefreshTokenHash(hash);
    if (
      !user ||
      !user.refreshTimeout ||
      user.refreshTimeout < getCurrentTime()
    ) {
      throw new UnauthorizedException();
    }
    return await this.generateJwtToken(user.id, user.rank);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const result = await this.userService.updatePassword(userId, dto);
    return await this.generateTokenPair(userId, result.rank);
  }

  async verifyEmail(userId: string, token: string) {
    const verified = await this.userService.verifyEmail(userId, token);
    if (!verified) {
      return { url: `${process.env.HOME_URL}/verify-error` };
    }
    this.userService.removeRefreshToken(userId);
    return { url: `${process.env.HOME_URL}/verify-success` };
  }

  async cancelVerification(userId: string, token: string) {
    return await this.userService.cancelVerification(userId, token);
  }

  async resendVerificationEmail(userId: string) {
    return await this.userService.resendVerificationEmail(userId);
  }

  // Generate JWT / Refresh Token
  async generateTokenPair(userId: string, rank: Ranks): Promise<TokenPair> {
    const access = await this.generateJwtToken(userId, rank);
    const refresh = await this.generateRefreshToken(userId);
    return {
      accessToken: access,
      refreshToken: refresh.token,
      refreshTimeout: refresh.timeout,
    };
  }

  async generateJwtToken(userId: string, rank: Ranks) {
    const payload: JwtPayload = {
      id: userId,
      rank: rank,
    };
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(
    userId: string,
  ): Promise<{ token: string; timeout: Date }> {
    const token = getToken();
    const timeout = getRefreshTimeout();
    await this.userService.updateRefreshToken(userId, token, timeout);
    return { token, timeout };
  }
}
