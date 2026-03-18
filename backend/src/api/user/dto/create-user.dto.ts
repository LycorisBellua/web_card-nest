import {
  IsEmail,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @Matches(/^[a-zA-Z0-9_]+$/)
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsEmail()
  email_unverified: string;

  @IsStrongPassword()
  password: string;
}
