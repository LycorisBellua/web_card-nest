import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { JwtPayload } from './jwt/auth.jwt-payload';
import type { Request as ExpressRequest } from 'express';
import type { Response as ExpressResponse } from 'express';
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { LoginDto } from '../user/dto/login.dto';
import { ForgotPasswordDto } from '../user/dto/forgot-password.dto';
import { ResetPasswordDto } from '../user/dto/reset-password.dto';
import { JWT, RedirectURL, ReturnMessage } from './types/auth.types';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async addUser(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<JWT> {
    await this.authService.signup(dto);
    const tokens = await this.authService.login(
      dto.email_unverified,
      dto.password,
    );
    const timeout = tokens.refreshTimeout.getTime() - Date.now();
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: timeout,
    });
    res.cookie('dummy_refresh', 'true', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: timeout,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<JWT> {
    const tokens = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    const timeout = tokens.refreshTimeout.getTime() - Date.now();
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: timeout,
    });
    res.cookie('dummy_refresh', 'true', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: timeout,
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<ReturnMessage> {
    const user = req['user'] as JwtPayload;
    await this.authService.logout(user.id);
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
    });
    res.cookie('dummy_refresh', '', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
    });
    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refresh(@Req() req: ExpressRequest): Promise<JWT> {
    const refreshToken = req.cookies['refresh_token'] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    return await this.authService.refresh(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Patch('password')
  async updatePassword(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<JWT> {
    const user = req['user'] as JwtPayload;
    const tokens = await this.authService.updatePassword(
      user.id,
      updatePasswordDto,
    );
    const timeout = tokens.refreshTimeout.getTime() - Date.now();
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: timeout,
    });
    res.cookie('dummy_refresh', 'true', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: timeout,
    });
    return { accessToken: tokens.accessToken };
  }

  @Get('/:userId/:token/verify')
  @Redirect(`${process.env.HOME_URL}/verify-success`)
  async verifyEmail(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('token') token: string,
  ): Promise<RedirectURL> {
    return await this.authService.verifyEmail(userId, token);
  }

  @Get('/:userId/:token/verify/cancel')
  @Redirect(`${process.env.HOME_URL}/verify-cancel`)
  async cancelVerificationRequest(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('token') token: string,
  ): Promise<ReturnMessage> {
    await this.authService.cancelVerification(userId, token);
    return { message: 'Success' };
  }

  @UseGuards(AuthGuard)
  @Get('verify/resend')
  async resendVerificationEmail(
    @Req() req: ExpressRequest,
  ): Promise<ReturnMessage> {
    const user = req['user'] as JwtPayload;
    await this.authService.resendVerificationEmail(user.id);
    return { message: 'Success' };
  }

  @UseGuards(AuthGuard)
  @Delete('/verify/cancel')
  async cancelEmailVerification(@Req() req: ExpressRequest): Promise<boolean> {
    const user = req['user'] as JwtPayload;
    return await this.authService.cancelVerificationBase(user.id);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ReturnMessage> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ReturnMessage> {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
