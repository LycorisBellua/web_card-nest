import { Prisma } from 'src/generated/prisma/client';

export type DMParticipants = {
  userAId: string;
  userBId: string;
};

// GET/CREATE CHAT
export const dMChatIdSelect = {
  id: true,
} satisfies Prisma.ChatSelect;

export type DMChatId = Prisma.ChatGetPayload<{
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
} satisfies Prisma.MessageSelect;

export type DMMessageId = Prisma.MessageGetPayload<{
  select: typeof dmMessageIdSelect;
}>;

// GET DM HISTORY
export const dMMessageSelect = {
  senderId: true,
  message: true,
} satisfies Prisma.MessageSelect;

export const dMMessageOrderBy = {
  id: 'asc',
} satisfies Prisma.MessageOrderByWithRelationInput;

export type DMHistory = Prisma.MessageGetPayload<{
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
  senderId: true,
  message: true,
} satisfies Prisma.LobbyMessageSelect;

export const lobbyMessageOrderBy = {
  id: 'asc',
} satisfies Prisma.LobbyMessageOrderByWithRelationInput;

export type LobbyHistory = Prisma.LobbyMessageGetPayload<{
  select: typeof lobbyMessageSelect;
}>[];

/*export const dMChatSelect = {
  id: true,
  userAId: true,
  userBId: true,
} satisfies Prisma.ChatSelect;

export type ChatList = Prisma.ChatGetPayload<{
  select: typeof dMChatSelect;
}>[];*/
