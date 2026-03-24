import { Transform } from 'class-transformer';
import {
  sanitizeEmail,
  sanitizePassword,
  sanitizeUsername,
} from '../utils/user.sanitizer';
import {
  IsEmailFormatValid,
  IsEmailNotEmpty,
  IsPasswordLongEnough,
  IsPasswordNotTooLong,
  IsUsernameNotEmpty,
  IsUsernameNotTooLong,
  PasswordHasDigit,
  PasswordHasLowercase,
  PasswordHasNoControlChars,
  PasswordHasSymbol,
  PasswordHasUppercase,
  PasswordNotContainsEmail,
  PasswordNotContainsUsername,
} from '../utils/user.validator';

export class CreateUserDto {
  @Transform(({ value }) => sanitizeUsername(value as string))
  @IsUsernameNotEmpty()
  @IsUsernameNotTooLong()
  username: string;

  @Transform(({ value }) => sanitizeEmail(value as string))
  @IsEmailNotEmpty()
  @IsEmailFormatValid()
  email_unverified: string;

  @Transform(({ value }) => sanitizePassword(value as string))
  @IsPasswordLongEnough()
  @PasswordHasUppercase()
  @PasswordHasLowercase()
  @PasswordHasDigit()
  @PasswordHasSymbol()
  @PasswordNotContainsUsername('username')
  @PasswordNotContainsEmail('email_unverified')
  @PasswordHasNoControlChars()
  @IsPasswordNotTooLong()
  password: string;
}
