import { useEffect, useState } from 'react';
import { useSocket } from 'tmp-ws/useSocket';
import type { Message } from 'tmp-ws/socket';

export const Room = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.emit('FetchLobbyHistory', (data) => {
      setMessages(data);
    });
  }, [socket]);

  useEffect(() => {
    socket.on('PublicMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('PublicMessage');
    };
  }, [socket]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('PublicMessage', input);
    setMessages((prev) => [...prev, { Sender: 'me', message: input }]);
    setInput('');
  };

  const userId = (socket.io.opts.query as { userId?: string })?.userId ?? '';

  return (
    <div>
      <h3>Chat - your ID: {userId}</h3>

      <div style={{ border: '1px solid #ccc', height: 200, overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.Sender}: </strong>
            {msg.message}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Room;
