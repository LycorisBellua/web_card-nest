import { Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @Matches(/^[a-zA-Z0-9_]+$/)
  @MinLength(3)
  @MaxLength(20)
  username: string;
}
