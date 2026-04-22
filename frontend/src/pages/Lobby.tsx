import { useRef, useEffect } from 'react';
import ChatPage from 'components/chat/ChatPage';
import ChatHead from 'components/chat/ChatHead';
import ChatMsgArea from 'components/chat/ChatMsgArea';
import ChatEvent from 'components/chat/ChatEvent';
import ChatDate from 'components/chat/ChatDate';
import ChatMsg from 'components/chat/ChatMsg';
import ChatInput from 'components/chat/ChatInput';

function Lobby() {
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  // TODO: Replace with real time data
  const nbr_online = 42;
  const users = [
    {
      username: 'Espresso',
      avatar: 'https://pics.craiyon.com/2023-11-16/Gf0MaOtPQDeq60d49Ai6uA.webp',
      rank: 'user',
      isOnline: true,
    },
    {
      username: 'Jookebox',
      avatar:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR_uvplX64OVu7oEysYZ5HjfMVUgjb9LEzEllowZk8UA&s',
      rank: 'admin',
      isOnline: true,
    },
    {
      username: 'Lumière',
      avatar:
        'https://college.taylors.edu.my/content/dam/taylorsrevamp/college/student-life/news-and-articles/2024/shadows-in-the-candles-glow-bringing-sustainability-to-light/taylors-article-shadows-in-the-candles-glow-hero-banner-mobile-768x650.png/jcr:content/renditions/cq5dam.web.768.650.webp',
      rank: 'user',
      isOnline: false,
    },
    {
      username: 'MuffinTop',
      avatar:
        'https://www.shutterstock.com/image-photo/kawaiistyle-chocolate-muffin-smiling-big-600nw-2758545531.jpg',
      rank: 'user',
      isOnline: true,
    },
    {
      username: 'Sagewick',
      avatar:
        'https://static.vecteezy.com/ti/vecteur-libre/p1/43511509-cerise-fleurs-illustration-vectoriel.jpg',
      rank: 'mod',
      isOnline: false,
    },
    {
      username: 'Tealeaf',
      avatar:
        'https://thumbs.dreamstime.com/b/cute-kawaii-teapot-cartoon-floral-accent-illustration-cheerful-yellow-pink-lid-teal-handle-adorned-flower-style-445328393.jpg',
      rank: 'mod',
      isOnline: false,
    },
  ];
  const msgs = [
    {
      created: new Date('April 19, 2026 21:14:32'),
      content:
        "good evening everyone ☕ rain's coming down outside. perfect night to stay in and play some cards?",
    },
    {
      created: new Date('April 19, 2026 21:16:41'),
      content:
        "this place is so cozy!! I literally just stumbled in but I think I'll be staying a while 🥹",
    },
    {
      created: new Date('April 19, 2026 21:17:18'),
      content:
        'welcome glad you found us. make yourself at home - the lobby is always open.',
    },
    {
      created: new Date('April 19, 2026 21:19:01'),
      content:
        'Come join, no pressure at all. Jookebox put some lo-fi on too so the vibes are immaculate rn',
    },
    {
      created: new Date('April 19, 2026 21:21:21'),
      content: 'saving me a seat?? 🙏 be there in 5',
    },
    {
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
