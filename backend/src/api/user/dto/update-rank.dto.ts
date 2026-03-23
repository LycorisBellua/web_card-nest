import { IsEnum } from 'class-validator';
import { Ranks } from 'src/generated/prisma/enums';

export class UpdateRankDto {
  @IsEnum(Ranks)
  rank: Ranks;
}
