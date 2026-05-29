import { Prisma } from 'src/generated/prisma/client';

// CREATE BAN
export const banCreateSelect = {
  userId: true,
  date: true,
} satisfies Prisma.LobbyBanSelect;

export type NewBan = Prisma.LobbyBanGetPayload<{
  select: typeof banCreateSelect;
}>;

// DELETE BAN
export const banDeleteSelect = {
  userId: true,
} satisfies Prisma.LobbyBanSelect;

export type DeletedBan = Prisma.LobbyBanGetPayload<{
  select: typeof banDeleteSelect;
}>;

// GET BAN LIST
export const banListOrder = {
  user: { username: 'asc' },
} satisfies Prisma.LobbyBanOrderByWithRelationInput;

export const banListInclude = {
  user: { select: { username: true } },
} satisfies Prisma.LobbyBanInclude;

export type BanListRaw = Prisma.LobbyBanGetPayload<{
  include: typeof banListInclude;
}>[];

export type BanList = {
  username: string;
  userId: string;
  date: Date;
}[];

// GET MESSAGE SENDER
export const lobbySenderSelect = {
  senderId: true,
} satisfies Prisma.LobbyMessageSelect;

export type LobbyMessageSender = Prisma.LobbyMessageGetPayload<{
  select: typeof lobbySenderSelect;
}>;

// MODERATE LOBBY MESSAGE
export const lobbyModeratedSelect = {
  id: true,
  moderated: true,
  message: true,
} satisfies Prisma.LobbyMessageSelect;

export const lobbyModeratedData = {
  moderated: true,
  message: '',
} satisfies Prisma.LobbyMessageUpdateInput;

export type LobbyMessageModerated = Prisma.LobbyMessageGetPayload<{
  select: typeof lobbyModeratedSelect;
}>;
