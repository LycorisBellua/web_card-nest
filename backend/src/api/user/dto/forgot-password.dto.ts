import { Transform } from 'class-transformer';
import { sanitizeEmail } from '../utils/user.sanitizer';
import { IsEmailFormatValid, IsEmailNotEmpty } from '../utils/user.validator';

export class ForgotPasswordDto {
  @Transform(({ value }) => sanitizeEmail(value as string))
  @IsEmailNotEmpty()
  @IsEmailFormatValid()
  email: string;
}
