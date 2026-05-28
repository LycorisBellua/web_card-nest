import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { createHash, compareHash, getCurrentTime } from '../user/utils/user.utils';
import { JwtPayload } from './jwt/auth.jwt-payload';
import { SendMailService } from '../sendMail/sendMail.service';
import { randomBytes } from 'crypto';

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

  async login(
    email: string,
    password: string,
  ): Promise<{ refreshToken: string; timeout: Date; accessToken: string }> {
    const found = await this.userService.userExistsByEmail(email);

    if (found?.loginLockedUntil && found.loginLockedUntil > new Date()) {
      const remaining = Math.ceil((found.loginLockedUntil.getTime() - Date.now()) / 60000)
      throw new UnauthorizedException(`Too many attempts. Try again in ${remaining} minutes.`)
    }

    if (
      !found ||
      (found.email && found.email !== email) ||
      !(await compareHash(password, found.password))
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

    await this.userService.updateLoginAttempts(found.id, 0, null)

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

 async executeForgotPassword(email: string) {
    const user = await this.userService.userExistsByEmail(email)

    if (!user) {
        return { success: true, message: "If this email exists, a link has been sent." }
    }

    if (!user.email) {
      await this.userService.sendResetPasswordUnverifiedEmail(user.id)
      return { success: true, message: "If this email exists, a link has been sent." }
    }

    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 30 * 60 * 1000)
    await this.userService.saveResetToken(user.id, await createHash(token), expiry)

    const link = `${process.env.HOME_URL}/reset-password?token=${token}`
    await this.mailer.sendMail(
        email,
        "Password reset",
        `Click on this link to reset your password: ${link}\n\nThis link expires in 30 minutes.`
    )

    return { success: true, message: "If this email exists, a link has been sent." }
}

  async resetPassword(token: string, newPassword: string) {
      const users = await this.userService.findUsersWithValidToken()

      const user = await Promise.all(
          users.map(async (u) => ({
              user: u,
              match: await compareHash(token, u.verifyToken!)
          }))
      ).then(results => results.find(r => r.match)?.user)

      if (!user) {
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