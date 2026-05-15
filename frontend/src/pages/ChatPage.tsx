import { SocketProvider } from '../components/websocket/socketContext';
import { useState } from 'react';
import { Chat } from "../components/chat/chat"
import { FriendList } from "../components/chat/RealTimeFriendList"
// import { UserFriendList } from "../components/Chat"

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
      <FriendList/>
      <Chat />
    </SocketProvider>
  );
}

