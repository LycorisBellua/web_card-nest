import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import {
  compareHash,
  getCurrentTime,
  getRefreshTimeout,
} from '../user/utils/user.utils';
import { JwtPayload } from './jwt/auth.jwt-payload';
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { RefreshPayload } from './jwt/auth.refresh-payload';
import { jwtConstants } from './jwt/auth.jwt-secret';
import { KeyPair } from './jwt/auth.key-pair';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.userService.addUser(createUserDto);
  }

  async login(email: string, password: string): Promise<KeyPair> {
    const found = await this.userService.userExistsByEmail(email);
    if (
      !found ||
      (found.email && found.email !== email) ||
      !(await compareHash(password, found.password))
    ) {
      throw new UnauthorizedException('Email address or password incorrect.');
    }
    return this.generateKeyPair(found.id);
  }

  async logout(userId: string) {
    return await this.userService.removeRefreshToken(userId);
  }

  async refresh(refreshToken: string): Promise<string> {
    try {
      const payload: RefreshPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: jwtConstants.refreshSecret,
        },
      );
      const user = await this.userService.userExistsOrThrow(payload.id);
      if (
        !user.refreshToken ||
        !(await compareHash(refreshToken, user.refreshToken))
      ) {
        throw new UnauthorizedException();
      }
      return await this.generateJwtToken(payload.id);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    await this.userService.updatePassword(userId, dto);
    return await this.generateKeyPair(userId);
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

  // Generate JWT / Refresh Token
  async generateKeyPair(userId: string): Promise<KeyPair> {
    const access = await this.generateJwtToken(userId);
    const refresh = await this.generateRefreshToken(userId);
    const timeout = getRefreshTimeout();
    return {
      accessToken: access,
      refreshToken: refresh,
      refreshTimeout: timeout,
    };
  }

  async generateJwtToken(userId: string) {
    const user = await this.userService.userExistsOrThrow(userId);
    const payload: JwtPayload = {
      id: userId,
      rank: user.rank,
    };
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(userId: string) {
    const payload: RefreshPayload = {
      id: userId,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '30d',
    });
    await this.userService.updateRefreshToken(userId, token);
    return token;
  }
}
