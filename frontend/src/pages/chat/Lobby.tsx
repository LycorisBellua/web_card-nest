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
import { ChatInput, DisabledChatInput } from 'components/chat/ChatInput';

function Lobby() {
  const { isAuthLoading, user, blocked } = useUser();
  const { socket, onlineUsers } = useSocket();
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
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
    if (isAuthLoading) return;
    socket.emit('FetchLobbyHistory', (data: PublicMsg[]) => {
      const filtered = data.filter(
        (m) => !blocked.some((b) => b.id === m.senderId),
      );
      const msg = filtered.map(normalizeMsg);
      setMessages(msg);
    });
    socket.emit('GetSelfLobbyTimeoutStatus', (data: boolean) => {
      setIsTimedOut(data);
    });

    socket.on('PublicMessage', (data: PublicMsg) => {
      setMessages((prev) => [...prev, normalizeMsg(data)]);
    });
    socket.on('messageModerated', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, moderated: true, message: '' } : msg,
        ),
      );
    });
    socket.on('LobbyTimeoutStatus', ({ isBanned, isGuest }) => {
      if (isGuest && user) return;
      setIsTimedOut(isBanned);
    });

    return () => {
      socket.off('PublicMessage');
      socket.off('messageModerated');
      socket.off('LobbyTimeoutStatus');
    };
  }, [socket, isAuthLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {isTimedOut ? (
        <DisabledChatInput />
      ) : (
        <ChatInput onSend={(input) => sendMessage(input)} />
      )}
    </ChatPage>
  );
}

export default Lobby;
