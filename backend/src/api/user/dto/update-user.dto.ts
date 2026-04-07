import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  sanitizeEmail,
  sanitizeUsername,
  sanitizeDescription,
} from '../utils/user.sanitizer';
import {
  IsAvatarDimensionsValid,
  IsAvatarNotTooBig,
  IsAvatarPng,
  IsEmailFormatValid,
  IsEmailNotEmpty,
  IsUsernameNotEmpty,
  IsUsernameNotTooLong,
  IsDescriptionNotTooLong,
} from '../utils/user.validator';

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => sanitizeUsername(value as string))
  @IsUsernameNotEmpty()
  @IsUsernameNotTooLong()
  username: string;

  @IsOptional()
  @Transform(({ value }) => sanitizeEmail(value as string))
  @IsEmailNotEmpty()
  @IsEmailFormatValid()
  email_unverified: string;

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
