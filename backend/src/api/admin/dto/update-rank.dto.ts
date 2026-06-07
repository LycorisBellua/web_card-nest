import { IsUUID, IsEnum } from 'class-validator';
import { Ranks } from 'src/generated/prisma/enums';

export class UpdateRankDto {
  @IsUUID('7')
  targetId: string;

  @IsEnum(Ranks)
  rank: Ranks;
}
