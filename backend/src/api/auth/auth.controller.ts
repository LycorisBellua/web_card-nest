import {
  Body,
  Controller,
  Get,
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

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async addUser(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    await this.authService.signup(dto);
    const tokens = await this.authService.login(
      dto.email_unverified,
      dto.password,
    );
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: tokens.refreshTimeout.getTime() - Date.now(),
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const tokens = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: tokens.refreshTimeout.getTime() - Date.now(),
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const user = req['user'] as JwtPayload;
    await this.authService.logout(user.id);
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
    });
    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refresh(@Req() req: ExpressRequest) {
    const refreshToken = req.cookies['refresh_token'] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const token = await this.authService.refresh(refreshToken);
    return { accessToken: token };
  }

  @UseGuards(AuthGuard)
  @Patch('password')
  async updatePassword(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = req['user'] as JwtPayload;
    const tokens = await this.authService.updatePassword(
      user.id,
      updatePasswordDto,
    );
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: tokens.refreshTimeout.getTime() - Date.now(),
    });
    return { accessToken: tokens.accessToken };
  }

  @Get('/:userId/:token/verify')
  @Redirect(`${process.env.HOME_URL}/verify-success`)
  async verifyEmail(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('token') token: string,
  ) {
    return await this.authService.verifyEmail(userId, token);
  }

  @Get('/:userId/:token/verify/cancel')
  @Redirect(`${process.env.HOME_URL}/verify-cancel`)
  async cancelVerificationRequest(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('token') token: string,
  ) {
    return await this.authService.cancelVerification(userId, token);
  }

  @UseGuards(AuthGuard)
  @Get('resend')
  async resendVerificationEmail(@Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.authService.resendVerificationEmail(user.id);
  }
}
