import { useState, useEffect } from 'react';
import { UserContext } from 'context/UserContext';
import type { User, UserLimited, Thread } from 'context/Types';
import { RefreshTokenRequest, FetchSelfRequest } from 'functions/Requests';

const otherUsers: UserLimited[] = [
  {
    id: 'user_lcni7wrk8w8o3h486cpm0',
    username: 'Espresso',
    avatar: 'https://pics.craiyon.com/2023-11-16/Gf0MaOtPQDeq60d49Ai6uA.webp',
    rank: 'user',
    registered: new Date('2026-03-02'),
    description: '',
    isOnline: true,
  },
  {
    id: 'user_bbyow98qw7h2ah96oiego',
    username: 'Jookebox',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR_uvplX64OVu7oEysYZ5HjfMVUgjb9LEzEllowZk8UA&s',
    rank: 'admin',
    registered: new Date('2026-03-02'),
    description: '',
    isOnline: true,
  },
  {
    id: 'user_moz9vrwzlrqw7j5zb3x0r',
    username: 'Lumière',
    avatar:
      'https://college.taylors.edu.my/content/dam/taylorsrevamp/college/student-life/news-and-articles/2024/shadows-in-the-candles-glow-bringing-sustainability-to-light/taylors-article-shadows-in-the-candles-glow-hero-banner-mobile-768x650.png/jcr:content/renditions/cq5dam.web.768.650.webp',
    rank: 'user',
    registered: new Date('2026-03-02'),
    description: '',
    isOnline: false,
  },
  {
    id: 'user_n9almh3164vtsjsdepzo9',
    username: 'MuffinTop',
    avatar: '',
    rank: 'user',
    registered: new Date('2026-03-02'),
    description: '',
    isOnline: true,
  },
  {
    id: 'user_870fc29zbxk4rtixmwyp6',
    username: 'Sagewick',
    avatar:
      'https://static.vecteezy.com/ti/vecteur-libre/p1/43511509-cerise-fleurs-illustration-vectoriel.jpg',
    rank: 'mod',
    registered: new Date('2026-03-02'),
    description: '',
    isOnline: false,
  },
  {
    id: 'user_2uxmmlor04x70ybmrpsrc',
    username: 'Tealeaf',
    avatar:
      'https://thumbs.dreamstime.com/b/cute-kawaii-teapot-cartoon-floral-accent-illustration-cheerful-yellow-pink-lid-teal-handle-adorned-flower-style-445328393.jpg',
    rank: 'mod',
    registered: new Date('2026-03-02'),
    description: '',
    isOnline: false,
  },
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    async function automaticLogin() {
      const accessToken = await RefreshTokenRequest('');
      if (!accessToken.length) return;
      const user = await FetchSelfRequest(accessToken);
      setUser(user);
    }
    automaticLogin();
  }, []);

  // TODO: Use real data
  const [friendUsernames, setFriendUsernames] = useState<string[]>([
    'Espresso',
    'Jookebox',
    'Lumière',
    'MuffinTop',
    'Tealeaf',
  ]);

  const users = (user ? [user, ...otherUsers] : otherUsers).sort((a, b) =>
    a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }),
  );

  const friends = !user
    ? []
    : otherUsers
        .filter((u) => friendUsernames.includes(u.username))
        .sort((a, b) =>
          a.username.localeCompare(b.username, undefined, {
            sensitivity: 'base',
            numeric: true,
          }),
        );

  function addFriend(username: string) {
    setFriendUsernames((prev) => [...prev, username]);
  }

  function removeFriend(username: string) {
    setFriendUsernames((prev) => prev.filter((u) => u !== username));
  }

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: 'thread_group_lobby',
      type: 'group' as const,
      messages: [
        {
          id: 'msg_yvs8ks0gsh5sqyznon4au',
          authorId: 'user_lcni7wrk8w8o3h486cpm0',
          created: new Date('April 19, 2026 21:14:32'),
          content:
            "good evening everyone ☕ rain's coming down outside. perfect night to stay in and play some cards?",
          moderated: false,
        },
        {
          id: 'msg_lgudme5mmv8b9b6igg05m',
          authorId: null,
          created: new Date('April 19, 2026 21:16:41'),
          content:
            "this place is so cozy!! I literally just stumbled in but I think I'll be staying a while 🥹",
          moderated: false,
        },
        {
          id: 'msg_q7gggwrkfj7iqcsgkeedx',
          authorId: 'user_870fc29zbxk4rtixmwyp6',
          created: new Date('April 19, 2026 21:17:18'),
          content:
            'welcome glad you found us. make yourself at home - the lobby is always open.',
          moderated: false,
        },
        {
          id: 'msg_hc8q7ym2dr0fmh6fb0d3d',
          authorId: 'user_2uxmmlor04x70ybmrpsrc',
          created: new Date('April 19, 2026 21:19:01'),
          content:
            'Come join, no pressure at all. Jookebox put some lo-fi on too so the vibes are immaculate rn',
          moderated: false,
        },
        {
          id: 'msg_qk8r2qzewg0ejm2f2ml7h',
          authorId: 'user_n9almh3164vtsjsdepzo9',
          created: new Date('April 19, 2026 21:21:21'),
          content: 'saving me a seat?? 🙏 be there in 5',
          moderated: false,
        },
        {
          id: 'msg_x0gbww93f8t5inw3o4y8t',
          authorId: 'user_bbyow98qw7h2ah96oiego',
          created: new Date('April 19, 2026 21:22:23'),
          content:
            "always 🧁 also just queued two more hours of lo-fi so we're set for the night ✨",
          moderated: false,
        },
      ],
    },
    ...friends.map((u) => ({
      id: 'thread_dm_' + u.username.toLowerCase(),
      type: 'dm' as const,
      messages: [],
    })),
  ]);

  function postMessage(threadId: string, content: string) {
    setThreads((prev) =>
      prev.map((c) =>
        c.id !== threadId
          ? c
          : {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: crypto.randomUUID(),
                  authorId: user?.id ?? null,
                  created: new Date(),
                  content: content,
                  moderated: false,
                },
              ],
            },
      ),
    );
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        users,
        friends,
        addFriend,
        removeFriend,
        threads,
        postMessage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
