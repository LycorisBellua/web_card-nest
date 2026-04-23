import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { LoginDto } from '../user/dto/login.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async addUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signup(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: result.timeout.getTime() - Date.now(),
    });
    const accessToken = result.accessToken;
    return { accessToken };
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
    const [type, jwtToken] = req.headers.authorization?.split(' ') ?? [];
    const refreshToken = req.cookies['refresh_token'] as string | undefined;
    if (type !== 'Bearer' || !refreshToken) {
      throw new UnauthorizedException();
    }
    const accessToken = await this.authService.refresh(jwtToken, refreshToken);
    return { accessToken };
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

  @Get('/:userId/resend')
  async resendVerificationEmail(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.authService.resendVerificationEmail(userId);
  }
}
