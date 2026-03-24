import { Transform } from 'class-transformer';
import { sanitizeUsername } from '../utils/user.sanitizer';
import {
  IsUsernameNotEmpty,
  IsUsernameNotTooLong,
} from '../utils/user.validator';

export class UpdateUsernameDto {
  @Transform(({ value }) => sanitizeUsername(value as string))
  @IsUsernameNotEmpty()
  @IsUsernameNotTooLong()
  username: string;
}
