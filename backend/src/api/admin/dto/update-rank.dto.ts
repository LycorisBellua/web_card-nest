import { IsUUID, IsEnum } from 'class-validator';
import { Ranks } from 'src/generated/prisma/enums';

export class UpdateRankDto {
  @IsUUID()
  targetId: string;

  @IsEnum(Ranks)
  rank: Ranks;
}
