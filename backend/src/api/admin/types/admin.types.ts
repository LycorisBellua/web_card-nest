import { userProfileSelect } from 'src/api/user/types/user.types';
import { Prisma } from 'src/generated/prisma/client';

// GET BAN LIST
export const banListSelect = {
  user: { select: userProfileSelect },
} satisfies Prisma.LobbyBanSelect;

export const banListOrder = {
  user: { username: 'asc' },
} satisfies Prisma.LobbyBanOrderByWithRelationInput;

export type BannedUsers = Prisma.LobbyBanGetPayload<{
  select: typeof banListSelect;
}>[];

// MODERATE LOBBY MESSAGE
export const lobbyModeratedData = {
  moderated: true,
  message: '',
} satisfies Prisma.LobbyMessageUpdateInput;
