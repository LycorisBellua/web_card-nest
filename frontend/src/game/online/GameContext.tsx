import { createContext } from 'react';
import type { GameInfo } from 'game/online/types';
import type { GameState } from 'game/logic/types';

export type GameContextType = {
  // ----- server-owned lobby/occupancy -----
  info: GameInfo | null;
  // ----- relayed/owned gameplay (persisted to localStorage) -----
  state: GameState | null;
  // ----- an incoming invite awaiting this user's decision (drives the modal) -----
  invite: { gameId: string } | null;
  // ----- outgoing invites the leader is still waiting on (derived from info) -----
  pendingInvites: string[];
  // ----- the most recent invitee to decline, for an optional "X declined" notice -----
  lastRejectedId: string | null;
  error: string | null;

  // ----- derived -----
  localSeat: number; // this user's seat in info.players, or -1
  isLeader: boolean;
  isInGame: boolean; // info !== null
  isMyTurn: boolean; // localSeat === state.currentPlayerIdx && playing

  // ----- lobby -----
  createGame: (seats: number) => void;
  inviteUser: (invitedId: string) => void;
  acceptInvite: () => void;
  rejectInvite: () => void;
  startGame: () => void; // leader: deal + broadcast the first state
  leaveGame: () => void; // End Game

  // ----- gameplay (no-op unless allowed) -----
  hit: () => void; // only when it is this user's turn
  stand: () => void; // only when it is this user's turn
  newRound: () => void; // leader only
  clearError: () => void;
};

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);
