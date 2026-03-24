import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { sanitizeDescription } from '../utils/user.sanitizer';
import { IsDescriptionNotTooLong } from '../utils/user.validator';

export class UpdateDescDto {
  @IsOptional()
  @Transform(({ value }) =>
    value != null ? sanitizeDescription(value as string) : value,
  )
  @IsDescriptionNotTooLong()
  desc?: string;
}
