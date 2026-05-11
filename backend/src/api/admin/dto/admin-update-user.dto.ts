import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';
import {
  sanitizeUsername,
  sanitizeDescription,
} from '../../user/utils/user.sanitizer';
import {
  IsAvatarDimensionsValid,
  IsAvatarNotTooBig,
  IsAvatarPng,
  IsUsernameNotEmpty,
  IsUsernameNotTooLong,
  IsDescriptionNotTooLong,
} from '../../user/utils/user.validator';

export class AdminUpdateUserDto {
  @IsUUID()
  targetId: string;

  @IsOptional()
  @Transform(({ value }) => sanitizeUsername(value as string))
  @IsUsernameNotEmpty()
  @IsUsernameNotTooLong()
  username: string;

  @IsOptional()
  @IsAvatarPng()
  @IsAvatarNotTooBig()
  @IsAvatarDimensionsValid()
  avatar: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? sanitizeDescription(value) : undefined,
  )
  @IsDescriptionNotTooLong()
  desc?: string;
}
