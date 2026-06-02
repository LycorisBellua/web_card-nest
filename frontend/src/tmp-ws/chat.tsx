import { useEffect, useState } from 'react';
import { useSocket } from 'tmp-ws/useSocket';
import type { PrivateMessage } from 'tmp-ws/socket';

export const Chat = () => {
  const socket = useSocket();
  const [input, setInput] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [messages, setMessages] = useState<PrivateMessage[]>([]);

  useEffect(() => {
    if (!targetUserId) return;

    socket.emit('FetchConvoHistory', targetUserId, (response) => {
      setMessages(response);
    });
  }, [socket, targetUserId]);

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('PrivateMessage', { targetUserId, message: input });
    setMessages((prev) => [...prev, { senderId: 'me', message: input }]);
    setInput('');
  };

  const userId = (socket.io.opts.query as { userId?: string })?.userId ?? '';

  return (
    <div>
      <h3>Chat - your ID: {userId}</h3>

      <div>
        <label>Target User ID:</label>
        <input
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          placeholder="Enter receiver userId"
        />
      </div>

      <div style={{ border: '1px solid #ccc', height: 200, overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.senderId}: </strong>
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

export default Chat;
