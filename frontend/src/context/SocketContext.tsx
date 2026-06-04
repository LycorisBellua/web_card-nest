import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import type { PublicMsg, PrivateMsg } from 'context/Types';

interface ServerToClientEvents {
  PublicMessage: (data: PublicMsg) => void;
  receiveMessage: (data: PrivateMsg) => void;
  OnlineUsers: (data: string[]) => void;
}

interface ClientToServerEvents {
  PublicMessage: (message: string) => void;
  PrivateMessage: (payload: { targetUserId: string; message: string }) => void;
  FetchLobbyHistory: (callback: (data: PublicMsg[]) => void) => void;
  FetchConvoHistory: (
    targetUserId: string,
    callback: (data: PrivateMsg[]) => void,
  ) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: AppSocket = io({
  autoConnect: false,
  withCredentials: true,
  path: '/socket.io',
});

interface SocketContextType {
  socket: AppSocket;
  onlineUsers: Set<string>;
}

export const SocketContext = createContext<SocketContextType>({
  socket,
  onlineUsers: new Set(),
});
