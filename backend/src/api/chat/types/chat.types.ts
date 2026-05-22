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

export const messageSelect = {
  senderId: true,
  message: true,
} satisfies Prisma.MessageSelect;

export type Message = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

export type MessageHistory = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>[];
