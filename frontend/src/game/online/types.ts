import type { GameState } from 'game/logic/types';

export type Occupant =
  | { type: 'human'; id: string }
  | { type: 'bot'; id: 'bot' };

export type Timeout = {
  occupant: Occupant;
  timer: number;
  seat: number;
  leader: boolean;
};

export type GameInfo = {
  gameId: string;
  seats: number;
  humans: number;
  players: Occupant[];
  timeouts: Timeout[];
  leader: string;
  invited?: { id: string; username: string }[];
};

export type RelayMessage =
  | { kind: 'state'; seq: number; game: GameState }
  | { kind: 'identify'; seat: number; username: string };
