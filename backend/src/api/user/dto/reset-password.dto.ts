import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { sanitizePassword } from '../utils/user.sanitizer';
import {
  IsPasswordLongEnough,
  IsPasswordNotTooLong,
  PasswordHasDigit,
  PasswordHasLowercase,
  PasswordHasNoControlChars,
  PasswordHasSymbol,
  PasswordHasUppercase,
} from '../utils/user.validator';

export class ResetPasswordDto {
  @IsEmail()
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
