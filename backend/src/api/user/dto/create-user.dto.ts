import {
  IsEmail,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username must contain only alphanumeric characters and underscores',
  })
  username: string;

  @IsEmail()
  email_unverified: string;

  @IsStrongPassword()
  password: string;
}
