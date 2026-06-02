import { useState } from 'react';
import { SocketProvider } from 'tmp-ws/socketContext';
import { Chat } from 'tmp-ws/chat';
import { Room } from 'tmp-ws/room';
import { FriendList } from 'tmp-ws/RealTimeFriendList';

export function ChatApp() {
  const [userId, setUserId] = useState('');
  const [connected, setConnected] = useState(false);

  if (!connected) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Socket Test Login</h2>

        <input
          placeholder="Enter your userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button
          onClick={() => {
            if (userId.trim()) setConnected(true);
          }}
        >
          Connect
        </button>
      </div>
    );
  }

  return (
    <SocketProvider userId={userId}>
      <Chat />
      <FriendList />
      <Room />
    </SocketProvider>
  );
}
