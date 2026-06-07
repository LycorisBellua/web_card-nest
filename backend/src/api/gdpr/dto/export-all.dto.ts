import { IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';

export class ExportAllDto {
  @IsOptional()
  @IsBoolean()
  profile?: boolean;

  @IsOptional()
  @IsBoolean()
  lobby?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('7', { each: true })
  friendIds?: string[];
}
