import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { sanitizeEmail, sanitizePassword } from '../utils/user.sanitizer';
import {
  IsEmailFormatValid,
  IsEmailNotEmpty,
  IsPasswordLongEnough,
  IsPasswordNotTooLong,
  PasswordHasDigit,
  PasswordHasLowercase,
  PasswordHasNoControlChars,
  PasswordHasSymbol,
  PasswordHasUppercase,
} from '../utils/user.validator';

export class ResetPasswordDto {
  @Transform(({ value }) => sanitizeEmail(value as string))
  @IsEmailNotEmpty()
  @IsEmailFormatValid()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @Transform(({ value }) => sanitizePassword(value as string))
  @IsPasswordLongEnough()
  @PasswordHasUppercase()
  @PasswordHasLowercase()
  @PasswordHasDigit()
  @PasswordHasSymbol()
  @PasswordHasNoControlChars()
  @IsPasswordNotTooLong()
  newPassword: string;
}
