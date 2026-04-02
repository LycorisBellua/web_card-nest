import { Transform } from 'class-transformer';
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
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

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
