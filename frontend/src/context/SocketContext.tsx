import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import type { PublicMsg, PrivateMsg } from 'context/Types';
import type { GameInfo, RelayMessage } from 'game/online/types';

export type ServerToClientEvents = {
  PublicMessage: (data: PublicMsg) => void;
  receiveMessage: (data: PrivateMsg) => void;
  OnlineUsers: (data: string[]) => void;
  messageModerated: (data: { messageId: string }) => void;
  LobbyTimeoutStatus: (data: { isBanned: boolean; isGuest: boolean }) => void;

  // ----- Game (online mode) -----
  /** Lobby/occupancy snapshot: seats, humans vs bots, leader, timeouts. */
  GameInfo: (data: GameInfo) => void;
  /** A registry error tied to a game action (human-readable message). */
  GameError: (message: string) => void;
  /** An invite addressed to this client; payload is the gameId to join. */
  GameInvite: (gameId: string) => void;
  /** The leader is told an invitee declined, so it can update its list. */
  GameRejected: (data: { gameId: string; invitedId: string }) => void;
  /** Relayed gameplay from a peer (see RelayMessage). */
  GameState: (data: RelayMessage) => void;
};

export type ClientToServerEvents = {
  PublicMessage: (message: string) => void;
  PrivateMessage: (payload: { targetUserId: string; message: string }) => void;
  FetchLobbyHistory: (callback: (data: PublicMsg[]) => void) => void;
  FetchConvoHistory: (
    targetUserId: string,
    callback: (data: PrivateMsg[]) => void,
  ) => void;
  ModerateLobbyMessage: (messageId: string) => void;
  GetSelfLobbyTimeoutStatus: (callback: (data: boolean) => void) => void;

  // ----- Game (online mode) -----
  // The server derives the creator/leader/sender id from the JWT, so the
  // client never sends its own id in these payloads.
  CreateGame: (payload: { seats: number }) => void;
  JoinGame: (payload: { gameId: string }) => void;
  LeaveGame: () => void;
  InviteGame: (payload: { gameId: string; invitedId: string }) => void;
  RejectGame: (payload: { gameId: string }) => void;
  /** Relay a gameplay message to the other humans in our game. */
  SyncGame: (payload: RelayMessage) => void;
};

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: AppSocket = io({
  autoConnect: false,
  withCredentials: true,
  path: '/socket.io',
});

export type SocketContextType = {
  socket: AppSocket;
  onlineUsers: Set<string>;
};

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined,
);
