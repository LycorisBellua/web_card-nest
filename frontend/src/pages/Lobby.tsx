import { useRef, useEffect } from 'react';
import { useUser } from 'context/useUser';
import ChatPage from 'components/chat/ChatPage';
import ChatHead from 'components/chat/ChatHead';
import ChatMsgArea from 'components/chat/ChatMsgArea';
import ChatEvent from 'components/chat/ChatEvent';
import ChatDate from 'components/chat/ChatDate';
import ChatMsg from 'components/chat/ChatMsg';
import ChatInput from 'components/chat/ChatInput';

function Lobby() {
  // TODO: Replace with real time data
  const { user, users, threads, postMessage } = useUser();
  const thread = threads.find((t) => t.id === 'thread_group_lobby')!;
  const lastMsg = thread?.messages.at(-1);
  const nbr_online = users.filter((u) => u.isOnline).length;

  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (lastMsg?.authorId === user?.id) {
      msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [user?.id, lastMsg]);

  // TODO: Real event instead of hardcoded.

  return (
    <ChatPage>
      <ChatHead title="the lobby" nbr_online={nbr_online} />
      <ChatMsgArea>
        {thread?.messages.length && (
          <ChatDate date={thread?.messages[0].created} />
        )}
        {thread?.messages.slice(0, 3).map((msg) => {
          const author = users.find((u) => u.id === msg.authorId) ?? null;
          return <ChatMsg key={msg.id} user={author} msg={msg} />;
        })}
        <ChatEvent users={[users[5], users[1], users[2]]} table_size={4} />
        {thread?.messages.slice(3).map((msg) => {
          const author = users.find((u) => u.id === msg.authorId) ?? null;
          return <ChatMsg key={msg.id} user={author} msg={msg} />;
        })}
        <div ref={msgsEndRef} />
      </ChatMsgArea>
      <ChatInput
        onSend={(content) => postMessage('thread_group_lobby', content)}
      />
    </ChatPage>
  );
}

export default Lobby;
