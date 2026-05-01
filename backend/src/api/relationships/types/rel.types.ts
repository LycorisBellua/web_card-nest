import { Prisma } from 'src/generated/prisma/client';

export const friendUserSelect = {
  id: true,
  username: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export const friendshipInclude = {
  requester: { select: friendUserSelect },
  addressee: { select: friendUserSelect },
} satisfies Prisma.FriendInclude;

export const blockInclude = {
  blocker: { select: friendUserSelect },
  blocked: { select: friendUserSelect },
} satisfies Prisma.BlockInclude;

export type FriendUser = Prisma.UserGetPayload<{
  select: typeof friendUserSelect;
}>;

export type FriendshipWithUsers = Prisma.FriendGetPayload<{
  include: typeof friendshipInclude;
}>[];

export type BlockWithUsers = Prisma.BlockGetPayload<{
  include: typeof blockInclude;
}>[];
