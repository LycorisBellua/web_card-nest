import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import {
  comparePasswordHash,
  compareTokenHash,
  createPasswordHash,
  createTokenHash,
  getCurrentTime,
  getToken,
  newPasswordContainsEmail,
  newPasswordContainsUsername,
} from '../user/utils/user.utils';
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import { JWT, RedirectURL, ReturnMessage, TokenSet } from './types/auth.types';

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
      (found.email && found.email.toLowerCase() !== email?.toLowerCase()) ||
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
    const refresh = await this.userService.generateRefreshToken(userId);
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

  async cancelVerificationBase(userId: string): Promise<boolean> {
    return await this.userService.cancelVerificationBase(userId);
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    await this.userService.resendVerificationEmail(userId);
  }

  async forgotPassword(email: string): Promise<ReturnMessage> {
    const user = await this.userService.userExistsByEmail(email);
    const generic: ReturnMessage = {
      message: 'If this email exists, a link has been sent.',
    };

    if (!user) {
      return generic;
    }

    if (!user.email) {
      await this.userService.sendResetPasswordUnverifiedEmail(user.id);
      return generic;
    }

    const token = getToken();
    const expiry = new Date(Date.now() + 30 * 60 * 1000);
    await this.userService.saveResetToken(
      user.id,
      createTokenHash(token),
      expiry,
    );
    await this.userService.sendResetPasswordEmail(user.email, token);

    return generic;
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<ReturnMessage> {
    const user = await this.userService.userExistsByEmail(email);
    if (
      !user ||
      !user.resetToken ||
      !user.resetTimeout ||
      user.resetTimeout < new Date() ||
      !compareTokenHash(token, user.resetToken)
    ) {
      return { message: 'Invalid or expired link.' };
    }
    if (
      newPasswordContainsEmail(newPassword, user.email) ||
      newPasswordContainsUsername(newPassword, user.username)
    ) {
      throw new BadRequestException(
        'New password may not contain your username or email address.',
      );
    }
    const hashed = await createPasswordHash(newPassword);
    await this.userService.updatePasswordAndClearResetToken(user.id, hashed);
    await this.userService.sendPasswordResetSuccessEmail(user.email!);
    return { message: 'Password updated successfully.' };
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
