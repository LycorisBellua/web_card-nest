import { useEffect } from 'react';
import type { ReactNode } from 'react';
import socket from 'tmp-ws/Socket';
import { SocketContext } from 'tmp-ws/useSocket';

export const SocketProvider = ({
  children,
  accessToken,
}: {
  children: ReactNode;
  accessToken: string;
}) => {
  useEffect(() => {
    socket.auth = { accessToken };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
