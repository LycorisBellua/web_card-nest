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
  const { users } = useUser();
  const nbr_online = users.filter(u => u.isOnline).length;

  const msgsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  const msgs = [
    {
      id: 'msg_yvs8ks0gsh5sqyznon4au',
      author_id: 'user_lcni7wrk8w8o3h486cpm0',
      created: new Date('April 19, 2026 21:14:32'),
      content:
        "good evening everyone ☕ rain's coming down outside. perfect night to stay in and play some cards?",
    },
    {
      id: 'msg_lgudme5mmv8b9b6igg05m',
      author_id: null,
      created: new Date('April 19, 2026 21:16:41'),
      content:
        "this place is so cozy!! I literally just stumbled in but I think I'll be staying a while 🥹",
    },
    {
      id: 'msg_q7gggwrkfj7iqcsgkeedx',
      author_id: 'user_870fc29zbxk4rtixmwyp6',
      created: new Date('April 19, 2026 21:17:18'),
      content:
        'welcome glad you found us. make yourself at home - the lobby is always open.',
    },
    {
      id: 'msg_hc8q7ym2dr0fmh6fb0d3d',
      author_id: 'user_2uxmmlor04x70ybmrpsrc',
      created: new Date('April 19, 2026 21:19:01'),
      content:
        'Come join, no pressure at all. Jookebox put some lo-fi on too so the vibes are immaculate rn',
    },
    {
      id: 'msg_qk8r2qzewg0ejm2f2ml7h',
      author_id: 'user_n9almh3164vtsjsdepzo9',
      created: new Date('April 19, 2026 21:21:21'),
      content: 'saving me a seat?? 🙏 be there in 5',
    },
    {
      id: 'msg_x0gbww93f8t5inw3o4y8t',
      author_id: 'user_bbyow98qw7h2ah96oiego',
      created: new Date('April 19, 2026 21:22:23'),
      content:
        "always 🧁 also just queued two more hours of lo-fi so we're set for the night ✨",
    },
  ];
  // TODO: Currently, the date is hardcoded to be the one of the first message,
  // instead of showing every new day of messages.
  // TODO: Post a message to the chat.
  // TODO: Real event instead of hardcoded.

  return (
    <ChatPage>
      <ChatHead title="the lobby" nbr_online={nbr_online} />
      <ChatMsgArea>
        <ChatDate date={msgs[0].created} />
        <ChatMsg user={users[0]} msg={msgs[0]} />
        <ChatMsg user={null} msg={msgs[1]} />
        <ChatMsg user={users[4]} msg={msgs[2]} />
        <ChatEvent users={[users[5], users[1], users[2]]} table_size={4} />
        <ChatMsg user={users[5]} msg={msgs[3]} />
        <ChatMsg user={users[3]} msg={msgs[4]} />
        <ChatMsg user={users[1]} msg={msgs[5]} />
        <div ref={msgsEndRef} />
      </ChatMsgArea>
      <ChatInput />
    </ChatPage>
  );
}

export default Lobby;
