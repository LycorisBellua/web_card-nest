import {
  IsEmailFormatValid,
  IsEmailNotEmpty,
  IsPasswordNotTooLong,
  PasswordHasNoControlChars,
} from '../utils/user.validator';

export class LoginDto {
  @IsEmailNotEmpty()
  @IsEmailFormatValid()
  email: string;

  @PasswordHasNoControlChars()
  @IsPasswordNotTooLong()
  password: string;
}
