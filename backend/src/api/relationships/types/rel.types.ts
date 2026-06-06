import { userProfileSelect } from 'src/api/user/types/user.types';
import { Prisma } from 'src/generated/prisma/client';

// GET FRIENDSHIP / BLOCK LISTS
export const friendListInclude = {
  requester: { select: userProfileSelect },
  addressee: { select: userProfileSelect },
} satisfies Prisma.FriendInclude;

export type FriendListWithUserData = Prisma.FriendGetPayload<{
  include: typeof friendListInclude;
}>[];

export const blockListInclude = {
  blocked: { select: userProfileSelect },
} satisfies Prisma.BlockInclude;

export type BlockListWithUserData = Prisma.BlockGetPayload<{
  include: typeof blockListInclude;
}>[];
