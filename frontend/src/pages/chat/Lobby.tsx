import React, { useRef, useState, useEffect } from 'react';
import { useUser } from 'context/useUser';
import { useSocket } from 'context/useSocket';
import type { PublicMsg } from 'context/Types';
import { addAvatarPrefix } from 'functions/UserValidation';
import ChatPage from 'components/chat/ChatPage';
import ChatHead from 'components/chat/ChatHead';
import ChatMsgArea from 'components/chat/ChatMsgArea';
import ChatDate from 'components/chat/ChatDate';
import { PublicChatMsg } from 'components/chat/ChatMsg';
import { ChatInput } from 'components/chat/ChatInput';

function Lobby() {
  const { user } = useUser();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState<PublicMsg[]>([]);

  const lastMsg = messages.at(-1);
  const grouped =
    messages.reduce<Record<string, PublicMsg[]>>((acc, msg) => {
      const day = msg.date.toDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(msg);
      return acc;
    }, {}) ?? {};
  const msgsEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = (input: string) => {
    if (!input) return;
    socket.emit('PublicMessage', input);
  };

  const normalizeMsg = (msg: PublicMsg): PublicMsg => ({
    ...msg,
    date: new Date(msg.date),
    sender:
      msg.sender && msg.sender.id !== 'Guest'
        ? {
            ...msg.sender,
            avatar: msg.sender.avatar
              ? addAvatarPrefix(msg.sender.avatar)
              : null,
          }
        : null,
  });

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (lastMsg?.sender?.id === user?.id) {
      msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [user?.id, lastMsg]);

  useEffect(() => {
    socket.emit('FetchLobbyHistory', (data: PublicMsg[]) => {
      setMessages(data.map(normalizeMsg));
    });
  }, [socket]);

  useEffect(() => {
    socket.on('PublicMessage', (data: PublicMsg) => {
      setMessages((prev) => [...prev, normalizeMsg(data)]);
    });

    return () => {
      socket.off('PublicMessage');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('messageModerated', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, moderated: true, message: '' } : msg,
        ),
      );
    });

    return () => {
      socket.off('messageModerated');
    };
  }, [socket]);

  return (
    <ChatPage>
      <ChatHead is_dm={false} title="the lobby" nbr_online={onlineUsers.size} />
      <ChatMsgArea>
        {Object.entries(grouped).map(([day, msgs]) => (
          <React.Fragment key={day}>
            <ChatDate date={new Date(day)} />
            {msgs.map((msg) => (
              <PublicChatMsg key={msg.id} msg={msg} />
            ))}
          </React.Fragment>
        ))}
        <div ref={msgsEndRef} />
      </ChatMsgArea>
      <ChatInput onSend={(input) => sendMessage(input)} />
    </ChatPage>
  );
}

export default Lobby;
