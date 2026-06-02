import { useEffect } from 'react';
import type { ReactNode } from 'react';
import socket from './socket';
import { SocketContext } from './useSocket';

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

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
