import { createContext, useContext } from 'react';
import socket, { type AppSocket } from './socket';

export const SocketContext = createContext<AppSocket>(socket);

export const useSocket = (): AppSocket => useContext(SocketContext);
