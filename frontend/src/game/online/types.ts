import type { GameState } from 'game/logic/types';

/**
 * Online-mode types.
 *
 * These mirror the backend's *occupancy* model - who sits in which seat, who
 * leads, and who is mid-disconnect. The server owns this and pushes it via the
 * `GameInfo` event. The actual card game (`GameState` in game/logic/types) is
 * never seen by the server: it is relayed peer-to-peer through the
 * `SyncGame` (out) / `GameState` (in) events as a `RelayMessage`.
 */

export type Occupant =
  | { type: 'human'; id: string }
  | { type: 'bot'; id: 'bot' };

export type Timeout = {
  occupant: Occupant;
  /** Absolute Date.now()-based ms deadline to reclaim the seat (30s window). */
  timer: number;
  seat: number;
  leader: boolean;
};

/**
 * Lobby/occupancy snapshot from the server (the backend's `Game`).
 *
 * `players` is seat-indexed and aligns 1:1 with `GameState.players`, so the
 * occupant at seat `i` is the player rendered at index `i` on the canvas.
 *
 * `invited` is the set of users the leader has invited but who have not yet
 * taken a seat, as `{ id, username }` pairs. The server stores it as a Map and
 * the gateway emits it as an array (see the queued backend edit). It is
 * optional here and consumers must guard with `Array.isArray`, so the UI
 * degrades to an empty list if that edit is missing.
 */
export type GameInfo = {
  gameId: string;
  seats: number;
  humans: number;
  players: Occupant[];
  timeouts: Timeout[];
  leader: string;
  invited?: { id: string; username: string }[];
};

/**
 * What travels over the relay (sent via `SyncGame`, received via `GameState`).
 *
 *  - 'state'    : a full gameplay snapshot from the current authority - the
 *                 turn-holder for human turns, or the leader for the initial
 *                 deal, new rounds, and bot turns. `seq` is monotonic so
 *                 receivers can discard snapshots older than what they hold.
 *  - 'identify' : a client announcing its seat -> username, so opponents'
 *                 names can be shown on the canvas (the server only knows ids).
 *                 The leader merges these into the state it broadcasts, after
 *                 which the name lives inside the relayed GameState.
 */
export type RelayMessage =
  | { kind: 'state'; seq: number; game: GameState }
  | { kind: 'identify'; seat: number; username: string };
