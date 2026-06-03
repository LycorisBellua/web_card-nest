import { io, Socket } from 'socket.io-client';

// ---------- shared message shapes ----------

export interface Message {
  sender: string;
  message: string;
}

export interface PrivateMessage {
  senderId: string;
  message: string;
}

export interface Friend {
  username: string;
}

// ---------- socket event maps ----------

interface ServerToClientEvents {
  PublicMessage: (data: Message) => void;
  receiveMessage: (data: PrivateMessage) => void;
  OnlineUsers: (data: string[]) => void;
}

interface ClientToServerEvents {
  PublicMessage: (message: string) => void;
  PrivateMessage: (payload: { targetUserId: string; message: string }) => void;
  FetchLobbyHistory: (callback: (data: Message[]) => void) => void;
  FetchConvoHistory: (
    targetUserId: string,
    callback: (data: PrivateMessage[]) => void,
  ) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ---------- singleton ----------

const socket: AppSocket = io({
  autoConnect: false,
  withCredentials: true,
  path: '/socket.io',
});

export default socket;
