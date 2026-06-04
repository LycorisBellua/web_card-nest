import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { socket, SocketContext } from 'context/SocketContext';

export const SocketProvider = ({
  children,
  accessToken,
}: {
  children: ReactNode;
  accessToken: string;
}) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    socket.auth = { accessToken };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  useEffect(() => {
    socket.on('OnlineUsers', (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    return () => {
      socket.off('OnlineUsers');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
