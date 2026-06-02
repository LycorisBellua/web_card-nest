import { createContext, useContext } from 'react';
import socket, { type AppSocket } from 'tmp-ws/Socket';

export const SocketContext = createContext<AppSocket>(socket);

export const useSocket = (): AppSocket => useContext(SocketContext);
