import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import {
  comparePasswordHash,
  createTokenHash,
  getCurrentTime,
  getRefreshTimeout,
  compareHash,
  getToken,
} from '../user/utils/user.utils';
import { JwtPayload } from './jwt/auth.jwt-payload';
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { TokenPair } from './jwt/auth.token-pair';
import { Ranks } from 'src/generated/prisma/enums';
import { SendMailService } from '../sendMail/sendMail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailer: SendMailService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.userService.addUser(createUserDto);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const found = await this.userService.userExistsByEmail(email);

    if (found?.loginLockedUntil && found.loginLockedUntil > new Date()) {
      const remaining = Math.ceil((found.loginLockedUntil.getTime() - Date.now()) / 60000)
      throw new UnauthorizedException(`Too many attempts. Try again in ${remaining} minutes.`)
    }

    if (
      !found ||
      (found.email && found.email !== email) ||
      !(await comparePasswordHash(password, found.password))
    ) {
      if (found) {
        const attempts = found.loginAttempts + 1
        await this.userService.updateLoginAttempts(
          found.id,
          attempts,
          attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
        )
      }
      throw new UnauthorizedException('Email address or password incorrect.')
    }
    return await this.generateJwtToken(user.id, user.rank);
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
  async executeForgotPassword(email: string) {
    const user = await this.userService.userExistsByEmail(email)

    if (!user) {
        return { success: true, message: "If this email exists, a link has been sent." }
    }

    if (!user.email) {
      await this.userService.sendResetPasswordUnverifiedEmail(user.id)
      return { success: true, message: "If this email exists, a link has been sent." }
    }

    const token = getToken();
    const expiry = new Date(Date.now() + 30 * 60 * 1000)
    await this.userService.saveResetToken(user.id, await createHash(token), expiry)

    const emailInLink = user.email ?? user.email_unverified
    const link = `${process.env.HOME_URL}/reset-pwd?email=${emailInLink}&token=${token}`
    await this.mailer.sendMail(
        email,
        "Password reset",
        `Click on this link to reset your password: ${link}\n\nThis link expires in 30 minutes.`
    )

    return { success: true, message: "If this email exists, a link has been sent." }
}

  async resetPassword(email: string, token: string, newPassword: string) {
      const user = await this.userService.userExistsByEmail(email)
    
    console.log('user found:', !!user)
    console.log('resetToken:', user?.resetToken)
    console.log('resetTimeout:', user?.resetTimeout)
    console.log('now:', new Date())
    console.log('expired:', user?.resetTimeout ? user.resetTimeout < new Date() : 'null')
    console.log('token received:', token)
    const hashMatch = user?.resetToken ? await compareHash(token, user.resetToken) : false
    console.log('hash match:', hashMatch)


      if (
          !user ||
          !user.resetToken ||
          !user.resetTimeout ||
          user.resetTimeout < new Date() ||
          !(await compareHash(token, user.resetToken))
      ) {
          return { success: false, message: "Invalid or expired link." }
      }

      const hashed = await createHash(newPassword)
      await this.userService.updatePasswordAndClearToken(user.id, hashed)

      return { success: true, message: "Password updated successfully." }
  }

  async generateJwtToken(userId: string) {
    const user = await this.userService.userExistsOrThrow(userId);
    const payload = { id: userId, rank: user.rank };
    return await this.jwtService.signAsync(payload);
  }
}
