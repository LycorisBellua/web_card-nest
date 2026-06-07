import { useState, useEffect } from 'react';
import { UserContext } from 'context/UserContext';
import type { User, LimitedUser } from 'context/Types';
import { getCookieValue } from 'functions/Cookies';
import { refreshTokenRequest, fetchSelfRequest } from 'functions/Requests';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [blocked, setBlocked] = useState<LimitedUser[]>([]);
  const [friends, setFriends] = useState<LimitedUser[]>([]);
  const [sentFriends, setSentFriends] = useState<LimitedUser[]>([]);
  const [receivedFriends, setReceivedFriends] = useState<LimitedUser[]>([]);

  useEffect(() => {
    const automaticLogin = async () => {
      try {
        const dummyCookie = getCookieValue('dummy_refresh');
        if (!dummyCookie) throw new Error();
        const accessToken = await refreshTokenRequest('');
        if (!accessToken.length) throw new Error();
        const data = await fetchSelfRequest(accessToken);
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
