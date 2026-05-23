import { useUser } from 'context/useUser';
import NotFound from 'pages/NotFound';
import { ScrollablePage } from 'components/general/Scrollable';
import UserBtn from 'components/btn/UserBtn';

function Users() {
  const { user, users } = useUser();

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
