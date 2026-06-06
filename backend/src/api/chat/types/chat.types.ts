import { userProfileSelect } from 'src/api/user/types/user.types';
import { Prisma, Ranks } from 'src/generated/prisma/client';

export type DMParticipants = {
  userAId: string;
  userBId: string;
  friendshipId: string;
};

// CREATE DM MESSAGE
export type NewDMMessage = {
  chatId: string;
  senderId: string;
  message: string;
};

// GET DM HISTORY
export const dMMessageInclude = {
  sender: { select: userProfileSelect },
} satisfies Prisma.DMMessageInclude;

export const dMMessageOrderBy = {
  id: 'asc',
} satisfies Prisma.DMMessageOrderByWithRelationInput;

export type DMMessageRaw = Prisma.DMMessageGetPayload<{
  include: typeof dMMessageInclude;
}>;

export type DMHistory = {
  id: string;
  senderId: string;
  message: string;
  date: Date;
  chatId: string;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
    desc: string | null;
    rank: Ranks;
  };
}[];

// CREATE LOBBY MESSAGE
export type NewLobbyMessage = {
  senderId: string;
  message: string;
};

// GET LOBBY HISTORY
export const lobbyMessageInclude = {
  sender: { select: userProfileSelect },
} satisfies Prisma.LobbyMessageSelect;

export const lobbyMessageOrderBy = {
  id: 'asc',
} satisfies Prisma.LobbyMessageOrderByWithRelationInput;

export type LobbyHistoryRaw = Prisma.LobbyMessageGetPayload<{
  include: typeof lobbyMessageInclude;
}>[];

export type LobbyHistory = {
  id: string;
  senderId: string | null;
  message: string;
  date: Date;
  moderated: boolean;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
    desc: string | null;
    rank: Ranks;
  } | null;
}[];

export type GDPRLobbyHistory = {
  id: string;
  moderated: boolean;
  rank: Ranks | null;
  date: Date;
  senderId: string | null;
  username: string;
  message: string;
}[];

export type GDPRDMHistory = {
  id: string;
  date: Date;
  username: string;
  message: string;
}[];
