import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compareHash, getCurrentTime } from '../user/utils/user.utils';
import { JwtPayload } from './jwt/auth.jwt-payload';
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import { JWT, RedirectURL, TokenSet } from './types/auth.types';
import { OwnProfile, RefreshData, UserProfile } from '../user/types/user.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<OwnProfile> {
    return await this.userService.addUser(createUserDto);
  }

  async login(email: string, password: string): Promise<TokenSet> {
    const found = await this.userService.userExistsByEmail(email);
    if (
      !found ||
      (found.email && found.email !== email) ||
      !(await compareHash(password, found.password))
    ) {
      throw new UnauthorizedException('Email address or password incorrect.');
    }
    const refresh = await this.userService.generateRefreshToken(found.id);
    if (!refresh || !refresh.refreshToken || !refresh.refreshTimeout) {
      throw new InternalServerErrorException(ErrorMessages.REF_TOK_UPD_ERR);
    }
    const access = await this.generateJwtToken(found.id);
    return {
      refreshToken: refresh.refreshToken,
      refreshTimeout: refresh.refreshTimeout,
      accessToken: access.accessToken,
    };
  }

  async logout(userId: string): Promise<RefreshData> {
    return await this.userService.removeRefreshToken(userId);
  }

  async refresh(jwtToken: string, refreshToken: string): Promise<JWT> {
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

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    return await this.userService.updatePassword(userId, dto);
  }

  async verifyEmail(userId: string, token: string): Promise<RedirectURL> {
    const verified = await this.userService.verifyEmail(userId, token);
    if (!verified) {
      return { url: `${process.env.HOME_URL}/verify-error` };
    }
    return { url: `${process.env.HOME_URL}/verify-success` };
  }

  async cancelVerification(
    userId: string,
    token: string,
  ): Promise<UserProfile> {
    return await this.userService.cancelVerification(userId, token);
  }

  async resendVerificationEmail(userId: string): Promise<UserProfile> {
    return await this.userService.resendVerificationEmail(userId);
  }

  // Generate JWT
  async generateJwtToken(userId: string): Promise<JWT> {
    const user = await this.userService.userExistsOrThrow(userId);
    const payload = {
      id: userId,
      rank: user.rank,
    };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
