import { createContext } from 'react';
import type { GameInfo } from 'game/online/types';
import type { GameState } from 'game/logic/types';

export type GameContextType = {
  info: GameInfo | null;
  state: GameState | null;
  invite: { gameId: string } | null;
  pendingInvites: { id: string; username: string }[];
  lastRejectedId: string | null;
  error: string | null;

  localSeat: number;
  isLeader: boolean;
  isInGame: boolean;
  isMyTurn: boolean;

  createGame: (seats: number) => void;
  inviteUser: (username: string) => void;
  cancelInvite: (invitedId: string) => void;
  acceptInvite: () => void;
  rejectInvite: () => void;
  startGame: () => void;
  leaveGame: () => void;

  hit: () => void;
  stand: () => void;
  newRound: () => void;
  clearError: () => void;
};

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);
