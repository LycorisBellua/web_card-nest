import { Prisma } from 'src/generated/prisma/client';

export type DMParticipants = {
  userAId: string;
  userBId: string;
};

// GET/CREATE CHAT
export const dMChatIdSelect = {
  id: true,
} satisfies Prisma.DMChatSelect;

export type DMChatId = Prisma.DMChatGetPayload<{
  select: typeof dMChatIdSelect;
}>;

// CREATE DM MESSAGE
export type NewDMMessage = {
  chatId: string;
  senderId: string;
  message: string;
};

export const dmMessageIdSelect = {
  id: true,
} satisfies Prisma.DMMessageSelect;

export type DMMessageId = Prisma.DMMessageGetPayload<{
  select: typeof dmMessageIdSelect;
}>;

// GET DM HISTORY
export const dMMessageSelect = {
  senderId: true,
  message: true,
  sender: { select: { username: true, avatar: true, rank: true } },
} satisfies Prisma.DMMessageSelect;

export const dMMessageOrderBy = {
  id: 'asc',
} satisfies Prisma.DMMessageOrderByWithRelationInput;

export type DMHistory = Prisma.DMMessageGetPayload<{
  select: typeof dMMessageSelect;
}>[];

// CREATE LOBBY MESSAGE
export type NewLobbyMessage = {
  senderId: string;
  message: string;
};

export const lobbyMessageIdSelect = {
  id: true,
} satisfies Prisma.LobbyMessageSelect;

export type LobbyMessageId = Prisma.LobbyMessageGetPayload<{
  select: typeof lobbyMessageIdSelect;
}>;

// GET LOBBY HISTORY
export const lobbyMessageSelect = {
  id: true,
  senderId: true,
  message: true,
  moderated: true,
  sender: { select: { username: true, avatar: true, rank: true } },
} satisfies Prisma.LobbyMessageSelect;

export const lobbyMessageOrderBy = {
  id: 'asc',
} satisfies Prisma.LobbyMessageOrderByWithRelationInput;

export type LobbyMessageSingle = Prisma.LobbyMessageGetPayload<{
  select: typeof lobbyMessageSelect;
}>;

export type LobbyHistory = Prisma.LobbyMessageGetPayload<{
  select: typeof lobbyMessageSelect;
}>[];

// GET BAN ID
export const lobbyBanSelect = {
  userId: true,
} satisfies Prisma.LobbyBanSelect;

export type LobbyBan = Prisma.LobbyBanGetPayload<{
  select: typeof lobbyBanSelect;
}>;
