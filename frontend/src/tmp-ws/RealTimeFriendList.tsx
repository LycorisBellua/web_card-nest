import { useEffect, useState } from 'react';
import { useSocket } from 'tmp-ws/useSocket';
import type { Friend } from 'tmp-ws/Socket';

export const FriendList = () => {
  const socket = useSocket();
  const [connectedFriends, setConnectedFriends] = useState<Friend[]>([]);
  const [disconnectedFriends, setDisconnectedFriends] = useState<Friend[]>([]);

  useEffect(() => {
    socket.on('FriendListConnected', (data) => {
      setConnectedFriends(data);
    });

    return () => {
      socket.off('FriendListConnected');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('FriendListDisconnected', (data) => {
      setDisconnectedFriends(data);
    });

    return () => {
      socket.off('FriendListDisconnected');
    };
  }, [socket]);

  return (
    <div>
      <h2>Connected Friends</h2>
      <ul>
        {connectedFriends.map((friend, index) => (
          <li key={index}>{friend.username}</li>
        ))}
      </ul>

      <h2>Disconnected Friends</h2>
      <ul>
        {disconnectedFriends.map((friend, index) => (
          <li key={index}>{friend.username}</li>
        ))}
      </ul>
    </div>
  );
};
