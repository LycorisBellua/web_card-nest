import { Controller, Post, Body } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';

@Controller('api/auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  async forgotPassword(
    @Body() body: { email: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.passwordResetService.execute(body.email);
  }
}