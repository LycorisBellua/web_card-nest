import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import { JWT, RedirectURL, TokenSet } from './types/auth.types';
import { RefreshData } from '../user/types/user.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<void> {
    return await this.userService.addUser(createUserDto);
  }

  async login(email: string, password: string): Promise<TokenSet> {
    const found = await this.userService.userExistsByEmail(email);
    if (
      !found ||
      (found.email && found.email !== email) ||
      !(await comparePasswordHash(password, found.password))
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

  async logout(userId: string): Promise<void> {
    await this.userService.userExistsOrThrow(userId);
    await this.userService.removeRefreshToken(userId);
  }

  async refresh(refreshToken: string): Promise<JWT> {
    const hash = createTokenHash(refreshToken);
    const user = await this.userService.userExistsByRefreshTokenHash(hash);
    if (
      !user ||
      !user.refreshTimeout ||
      user.refreshTimeout < getCurrentTime()
    ) {
      throw new UnauthorizedException();
    }
    return await this.generateJwtToken(user.id);
  }

  async updatePassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<TokenSet> {
    const refresh = await this.generateRefreshToken(userId);
    if (!refresh || !refresh.refreshToken || !refresh.refreshTimeout) {
      throw new InternalServerErrorException(ErrorMessages.REF_TOK_UPD_ERR);
    }
    const access = await this.generateJwtToken(userId);
    await this.userService.updatePassword(userId, dto);
    return {
      accessToken: access.accessToken,
      refreshToken: refresh.refreshToken,
      refreshTimeout: refresh.refreshTimeout,
    };
  }

  async verifyEmail(userId: string, token: string): Promise<RedirectURL> {
    const verified = await this.userService.verifyEmail(userId, token);
    if (!verified) {
      return { url: `${process.env.HOME_URL}/verify-error` };
    }
    await this.userService.removeRefreshToken(userId);
    return { url: `${process.env.HOME_URL}/verify-success` };
  }

  async cancelVerification(userId: string, token: string): Promise<void> {
    await this.userService.cancelVerification(userId, token);
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    await this.userService.resendVerificationEmail(userId);
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

  async generateRefreshToken(userId: string): Promise<RefreshData> {
    const refreshToken = getToken();
    const refreshTimeout = getRefreshTimeout();
    await this.userService.generateRefreshToken(userId);
    return { refreshToken, refreshTimeout };
  }
}
