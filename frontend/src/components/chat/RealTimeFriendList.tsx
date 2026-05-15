import { useEffect, useState } from 'react';
import { useSocket } from '../websocket/socketContext';



export const FriendList = () =>
{
  const socket = useSocket();
  const [FriendListConnected, RefreshFriendListConnected] = useState<any[]>([]);
  const [FriendListDisconnected, RefreshFriendListDisconnected] = useState<any[]>([]);
  
  useEffect(() => {
    socket.on('FriendListConnected', (data: any[]) => {
      RefreshFriendListConnected(data);
    });

    return () => {
      socket.off('FriendListConnected');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('FriendListDisconnected', (data: any[]) => {
      RefreshFriendListDisconnected(data);
    });

    return () => {
      socket.off('FriendListDisconnected');
    };
  }, [socket]);

return ( 
  <div>
      <h2>Connected Friends</h2>

      <ul>
        {FriendListConnected.map((friend, index) => (
          <li key={index}>
            {friend.username}
          </li>
        ))}
      </ul>

      <h2>Disconnected Friends</h2>

      <ul>
        {FriendListDisconnected.map((friend, index) => (
          <li key={index}>
            {friend.username}
          </li>
        ))}
      </ul>
    </div>
    )

};
