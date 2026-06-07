import { useState, useEffect } from 'react';
import { UserContext } from 'context/UserContext';
import type { User, LimitedUser } from 'context/Types';
import { RefreshTokenRequest, FetchSelfRequest } from 'functions/Requests';

function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [blocked, setBlocked] = useState<LimitedUser[]>([]);
  const [friends, setFriends] = useState<LimitedUser[]>([]);
  const [sentFriends, setSentFriends] = useState<LimitedUser[]>([]);
  const [receivedFriends, setReceivedFriends] = useState<LimitedUser[]>([]);

  useEffect(() => {
    const automaticLogin = async () => {
      try {
        const dummyCookie = getCookie('dummy_refresh');
        if (!dummyCookie) return;
        const accessToken = await RefreshTokenRequest('');
        if (!accessToken.length) return;
        const data = await FetchSelfRequest(accessToken);
        setUser(data.user);
        setBlocked(data.blocked);
        setFriends(data.friends);
        setSentFriends(data.sentFriends);
        setReceivedFriends(data.receivedFriends);
      } catch {
        setUser(null);
        setBlocked([]);
        setFriends([]);
        setSentFriends([]);
        setReceivedFriends([]);
      }
    };
    void automaticLogin();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        blocked,
        setBlocked,
        friends,
        setFriends,
        sentFriends,
        setSentFriends,
        receivedFriends,
        setReceivedFriends,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
