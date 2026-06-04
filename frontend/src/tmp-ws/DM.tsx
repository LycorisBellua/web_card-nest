import { useEffect, useState } from 'react';
import { useSocket } from 'context/useSocket';
import type { PrivateMsg } from 'context/Types';

const DM = () => {
  const { socket } = useSocket();
  const [input, setInput] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [messages, setMessages] = useState<PrivateMsg[]>([]);

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
    setInput('');
  };

  const userId = (socket.io.opts.query as { userId?: string })?.userId ?? '';

  return (
    <div>
      <h3>DM - your ID: {userId}</h3>

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

export default DM;
