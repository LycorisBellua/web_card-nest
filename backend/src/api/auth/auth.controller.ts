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
import { JWT, RedirectURL, ReturnMessage } from './types/auth.types';
import { UserProfile } from '../user/types/user.types';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async addUser(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<JWT> {
    await this.authService.signup(dto);
    const login = await this.authService.login(
      dto.email_unverified,
      dto.password,
    );
    res.cookie('refresh_token', login.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: login.refreshTimeout.getTime() - Date.now(),
    });
    const accessToken = login.accessToken;
    return { accessToken };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<JWT> {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: result.refreshTimeout.getTime() - Date.now(),
    });
    const accessToken = result.accessToken;
    return { accessToken };
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
    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refresh(@Req() req: ExpressRequest): Promise<JWT> {
    const [type, jwtToken] = req.headers.authorization?.split(' ') ?? [];
    const refreshToken = req.cookies['refresh_token'] as string | undefined;
    if (type !== 'Bearer' || !refreshToken) {
      throw new UnauthorizedException();
    }
    return await this.authService.refresh(jwtToken, refreshToken);
  }

  @UseGuards(AuthGuard)
  @Patch('password')
  async updatePassword(
    @Req() req: ExpressRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserProfile> {
    const user = req['user'] as JwtPayload;
    return await this.authService.updatePassword(user.id, updatePasswordDto);
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
  ): Promise<UserProfile> {
    return await this.authService.cancelVerification(userId, token);
  }

  @UseGuards(AuthGuard)
  @Get('resend')
  async resendVerificationEmail(
    @Req() req: ExpressRequest,
  ): Promise<UserProfile> {
    const user = req['user'] as JwtPayload;
    return this.authService.resendVerificationEmail(user.id);
  }
}
