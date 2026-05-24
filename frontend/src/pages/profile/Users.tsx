import { useState, useEffect } from 'react';
import { useUser } from 'context/useUser';
import type { User, OtherUser } from 'context/Types';
import { RefreshTokenRequest } from 'functions/Requests';
import NotFound from 'pages/NotFound';
import { ScrollablePage } from 'components/general/Scrollable';
import UserBtn from 'components/btn/UserBtn';

function Users() {
  const { user, setUser } = useUser();
  const [users, setUsers] = useState<OtherUser[]>([]);

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        if (!user) return;
        let res = await fetch('/api/user/all/username', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        if (!res.ok) {
          if (res.status != 401) return;
          const accessToken = await RefreshTokenRequest(user.accessToken);
          if (!accessToken.length) return;
          setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
          res = await fetch('/api/user/all/username', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          });
          if (!res.ok) return;
        }
        const data = (await res.json()) as OtherUser[];
        setUsers(data);
      } catch {
        setUsers([]);
      }
    };
    void fetchUserList();
  }, [user, setUser]);

  if (!user || user.rank.toLowerCase() == 'pending') return <NotFound />;

  return (
    <ScrollablePage>
      <h1>Users</h1>
      <UserBtn key="guest" user={null} path="/user/guest" />
      {!users.length ? (
        <p>Empty user list</p>
      ) : (
        users.map((e) => (
          <UserBtn key={e.id} user={e} path={`/user/${e.username}`} />
        ))
      )}
    </ScrollablePage>
  );
}

export default Users;
