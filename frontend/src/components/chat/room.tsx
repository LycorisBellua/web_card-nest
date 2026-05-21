
import { useEffect, useState } from 'react';
import { useSocket } from '../websocket/socketContext';

type Message = {
  Sender: string;
  message: string;
};


export const  Room = () => {  
const socket = useSocket();
console.log("after useSocket call socket is connected : ", socket.connected === true);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
useEffect(() => {
    socket.on('PublicMessage', (data: Message) => {
      setMessages((prev: Message[]) => [...prev, data]);
    });

    // cleanup listener on unmount
    return () => {
      socket.off('PublicMessage');
      socket.disconnect();
    };
  }, [socket]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('PublicMessage', input);
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
