import { Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username must contain only alphanumeric characters and underscores',
  })
  username: string;
}
