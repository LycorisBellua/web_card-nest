/*
import React, { useRef, useEffect } from 'react';
import { useUser } from 'context/useUser';
import { useSocket } from 'context/useSocket';
import type { PublicMsg } from 'context/Types';
import ChatPage from 'components/chat/ChatPage';
import ChatHead from 'components/chat/ChatHead';
import ChatMsgArea from 'components/chat/ChatMsgArea';
import ChatDate from 'components/chat/ChatDate';
import { PublicChatMsg } from 'components/chat/ChatMsg';
import ChatInput from 'components/chat/ChatInput';

function Lobby() {
  // TODO: Replace with real time data
  const { user, threads, postMessage } = useUser();
  const { onlineUsers } = useSocket();
  const nbr_online = onlineUsers.length;
  const thread = threads.find((t) => t.id === 'thread_group_lobby');
  const lastMsg = thread?.messages.at(-1);
  const grouped =
    thread?.messages.reduce<Record<string, PublicMsg[]>>((acc, msg) => {
      const day = msg.created.toDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(msg);
      return acc;
    }, {}) ?? {};

  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (lastMsg?.authorId === user?.id) {
      msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [user?.id, lastMsg]);

  return (
    <ChatPage>
      <ChatHead is_dm={false} title="the lobby" nbr_online={nbr_online} />
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
      <ChatInput
        onSend={(content) => postMessage('thread_group_lobby', content)}
      />
    </ChatPage>
  );
}

export default Lobby;
*/

function Lobby() {
  return <div></div>;
}

export default Lobby;
