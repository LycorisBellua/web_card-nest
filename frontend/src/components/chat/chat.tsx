import { useEffect, useState } from 'react';
import { useSocket } from '../websocket/socketContext';

type Message = 
{
  Sender: string;
  message: string;
};



export const  Chat = () => 
{  
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]); 
  const [input, setInput] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
    useEffect(() => {
      socket.on('receiveMessage', (data: Message) => {
        setMessages((prev: Message[]) => [...prev, data]);
      });
      return () => {
        socket.off('receiveMessage');
        socket.disconnect();
      };
    }, [socket]);

    const sendMessage = () => 
      {
        if (!input.trim()) return;
        console.log("socket is connected : ", socket.connected === true);
        socket.emit('PrivateMessage', 
        {
          targetUserId: targetUserId,
          message: input,
        });
      setMessages((prev) => [
        ...prev,
        { Sender: 'me', message: input },
      ]);
      setInput('');
    };
    return (
      <div>
        <h3>Chat your ID {(socket.io.opts.query as { userId: string })?.userId}</h3>
    <div/>
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

export default Chat;