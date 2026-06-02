import { Prisma } from 'src/generated/prisma/client';

// MODERATE LOBBY MESSAGE
export const lobbyModeratedData = {
  moderated: true,
  message: '',
} satisfies Prisma.LobbyMessageUpdateInput;
