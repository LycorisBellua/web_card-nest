import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import type { PublicMsg, PrivateMsg } from 'context/Types';

export type ServerToClientEvents = {
  PublicMessage: (data: PublicMsg) => void;
  receiveMessage: (data: PrivateMsg) => void;
  OnlineUsers: (data: string[]) => void;
  messageModerated: (data: { messageId: string }) => void;
  LobbyTimeoutStatus: (data: { isBanned: boolean; isGuest: boolean }) => void;
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
