import { userProfileSelect } from 'src/api/user/types/user.types';
import { Prisma } from 'src/generated/prisma/client';

// LOBBY BAN
export const banSelect = {
  user: { select: userProfileSelect },
} satisfies Prisma.LobbyBanSelect;

export type BannedUser = Prisma.LobbyBanGetPayload<{
  select: typeof banSelect;
}>;

// GET BAN LIST
export const banListOrder = {
  user: { username: 'asc' },
} satisfies Prisma.LobbyBanOrderByWithRelationInput;

// MODERATE LOBBY MESSAGE
export const lobbyModeratedData = {
  moderated: true,
  message: '',
} satisfies Prisma.LobbyMessageUpdateInput;
