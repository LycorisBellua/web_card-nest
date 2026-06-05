import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { useSocket } from 'context/useSocket';
import type { PrivateMsg } from 'context/Types';
import { addAvatarPrefix } from 'functions/UserValidation';
import NotFound from 'pages/NotFound';
import ChatPage from 'components/chat/ChatPage';
import ChatHead from 'components/chat/ChatHead';
import ChatMsgArea from 'components/chat/ChatMsgArea';
import ChatDate from 'components/chat/ChatDate';
import { PrivateChatMsg } from 'components/chat/ChatMsg';
import ChatInput from 'components/chat/ChatInput';

function DM() {
  const { username } = useParams<{ username: string }>();
  const { user, friends } = useUser();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState<PrivateMsg[]>([]);

  const friend = friends.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  const nbr_online = onlineUsers.has(friend?.id ?? '') ? 2 : 1;
  const lastMsg = messages.at(-1);
  const grouped =
    messages.reduce<Record<string, PrivateMsg[]>>((acc, msg) => {
      const day = msg.date.toDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(msg);
      return acc;
    }, {}) ?? {};
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const accessAllowed =
    !!user && user.rank.toLowerCase() != 'pending' && !!friend;

  const sendMessage = (input: string) => {
    if (!accessAllowed || !input) return;
    socket.emit('PrivateMessage', { targetUserId: friend.id, message: input });
  };

  const normalizeMsg = (msg: PrivateMsg): PrivateMsg => ({
    ...msg,
    date: new Date(msg.date),
    sender: {
      ...msg.sender,
      avatar: msg.sender.avatar ? addAvatarPrefix(msg.sender.avatar) : null,
    },
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
    if (!accessAllowed) return;
    socket.emit('FetchConvoHistory', friend.id, (data: PrivateMsg[]) => {
      setMessages(data.map(normalizeMsg));
    });
  }, [socket, friend?.id, accessAllowed]);

  useEffect(() => {
    if (!accessAllowed) return;
    socket.on('receiveMessage', (data: PrivateMsg) => {
      setMessages((prev) => [...prev, normalizeMsg(data)]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket, accessAllowed]);

  if (!accessAllowed) {
    return <NotFound />;
  }

  return (
    <ChatPage>
      <ChatHead is_dm={true} title={friend.username} nbr_online={nbr_online} />
      <ChatMsgArea>
        {Object.entries(grouped).map(([day, msgs]) => (
          <React.Fragment key={day}>
            <ChatDate date={new Date(day)} />
            {msgs.map((msg) => (
              <PrivateChatMsg key={msg.id} msg={msg} />
            ))}
          </React.Fragment>
        ))}
        <div ref={msgsEndRef} />
      </ChatMsgArea>
      <ChatInput onSend={(input) => sendMessage(input)} />
    </ChatPage>
  );
}

export default DM;
