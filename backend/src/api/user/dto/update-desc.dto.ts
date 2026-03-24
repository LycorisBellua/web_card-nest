import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { sanitizeDescription } from '../utils/user.sanitizer';
import { IsDescriptionNotTooLong } from '../utils/user.validator';

export class UpdateDescDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? sanitizeDescription(value) : undefined,
  )
  @IsDescriptionNotTooLong()
  desc?: string;
}
