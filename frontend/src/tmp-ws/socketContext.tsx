import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import socket from './socket';

const SocketContext = createContext(socket);

export const SocketProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) => {
  useEffect(() => {
    socket.io.opts.query = { userId };
    socket.connect();
    socket.on('connect', () => {});
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
