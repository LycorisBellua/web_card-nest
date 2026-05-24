import { useState, useEffect } from 'react';
import { UserContext } from 'context/UserContext';
import type { User, UserLimited, Thread } from 'context/Types';
import { RefreshTokenRequest, FetchSelfRequest } from 'functions/Requests';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const automaticLogin = async () => {
      try {
        const accessToken = await RefreshTokenRequest('');
        if (!accessToken.length) return;
        const user = await FetchSelfRequest(accessToken);
        setUser(user);
      } catch {
        setUser(null);
      }
    };
    void automaticLogin();
  }, []);

  // TODO: Use real data
  //const [friendUsernames, setFriendUsernames] = useState<string[]>([]);

  const friends: UserLimited[] = [];
  /*
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
  */

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: 'thread_group_lobby',
      type: 'group' as const,
      messages: [
        {
          id: 'msg_yvs8ks0gsh5sqyznon4au',
          authorId: null,
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
          authorId: null,
          created: new Date('April 19, 2026 21:17:18'),
          content:
            'welcome glad you found us. make yourself at home - the lobby is always open.',
          moderated: false,
        },
        {
          id: 'msg_hc8q7ym2dr0fmh6fb0d3d',
          authorId: null,
          created: new Date('April 19, 2026 21:19:01'),
          content:
            'Come join, no pressure at all. Jookebox put some lo-fi on too so the vibes are immaculate rn',
          moderated: false,
        },
        {
          id: 'msg_qk8r2qzewg0ejm2f2ml7h',
          authorId: null,
          created: new Date('April 19, 2026 21:21:21'),
          content: 'saving me a seat?? 🙏 be there in 5',
          moderated: false,
        },
        {
          id: 'msg_x0gbww93f8t5inw3o4y8t',
          authorId: null,
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
        friends,
        //addFriend,
        //removeFriend,
        threads,
        postMessage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
