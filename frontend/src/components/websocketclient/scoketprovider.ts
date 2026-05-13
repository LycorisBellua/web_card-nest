import { createContext, useContext, useEffect} from 'react';
import type { ReactNode } from "react";
import socket from './socket';

const SocketContext = createContext(socket);

export const SocketProvider = ({ children, userId }: { children: ReactNode, userId: string }) => {
  useEffect(() => {
    socket.io.opts.query = { userId };
    console.log("connection socket context userid: " ,userId);
    socket.connect();
    console.log("connection socket context is coonected :  " , socket.connected);
    socket.on('connect', () => {
  console.log('connected');
});

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);