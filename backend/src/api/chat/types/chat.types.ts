import { Prisma } from 'src/generated/prisma/client';

export type ChatParticipants = {
  userAId: string;
  userBId: string;
};

export type NewMessage = {
  chatId: string;
  senderId: string;
  message: string;
};

export const chatSelect = {
  id: true,
  userAId: true,
  userBId: true,
} satisfies Prisma.ChatSelect;

export type ChatList = Prisma.ChatGetPayload<{
  select: typeof chatSelect;
}>[];

export const messageSelect = {
  senderId: true,
  date: true,
  message: true,
} satisfies Prisma.MessageSelect;

export type MessageHistory = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>[];
