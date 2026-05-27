import { Prisma } from 'src/generated/prisma/client';

export const lobbyBanOrder = {
  user: { username: 'asc' },
} satisfies Prisma.LobbyBanOrderByWithRelationInput;

export const lobbyBanInclude = {
  user: { select: { username: true } },
} satisfies Prisma.LobbyBanInclude;

export type BanListRaw = Prisma.LobbyBanGetPayload<{
  include: typeof lobbyBanInclude;
}>[];

export type BanList = {
  username: string;
  userId: string;
  date: Date;
}[];
