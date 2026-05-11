import { SetMetadata } from '@nestjs/common';
import { Ranks } from 'src/generated/prisma/enums';

export const RequiredRank = (rank: Ranks) => SetMetadata('rank', rank);
