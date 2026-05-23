import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from 'context/useUser';
import type { Msg } from 'context/Types';
import NotFound from 'pages/NotFound';
import ChatPage from 'components/chat/ChatPage';
import ChatHead from 'components/chat/ChatHead';
import ChatMsgArea from 'components/chat/ChatMsgArea';
import ChatDate from 'components/chat/ChatDate';
import ChatMsg from 'components/chat/ChatMsg';
import ChatInput from 'components/chat/ChatInput';

function DM() {
  const { username } = useParams<{ username: string }>();
  const { user, friends, threads, postMessage } = useUser();

  // TODO: Fetch the DM thread using `username`. In the meantime, use the context.
  const friend = friends.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  //
  const thread_name = `thread_dm_${friend?.username?.toLowerCase()}`;
  const thread = threads.find((t) => thread_name === t.id);
  const nbr_online = friend?.isOnline ? 2 : 1;
  const lastMsg = thread?.messages.at(-1);
  const grouped =
    thread?.messages.reduce<Record<string, Msg[]>>((acc, msg) => {
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

  if (!user || user.rank.toLowerCase() == 'pending' || !friend || !thread)
    return <NotFound />;

  return (
    <ChatPage>
      <ChatHead is_dm={true} title={friend.username} nbr_online={nbr_online} />
      <ChatMsgArea>
        {Object.entries(grouped).map(([day, msgs]) => (
          <React.Fragment key={day}>
            <ChatDate date={new Date(day)} />
            {msgs.map((msg) => (
              <ChatMsg key={msg.id} msg={msg} />
            ))}
          </React.Fragment>
        ))}
        <div ref={msgsEndRef} />
      </ChatMsgArea>
      <ChatInput onSend={(content) => postMessage(thread_name, content)} />
    </ChatPage>
  );
}

export default DM;
