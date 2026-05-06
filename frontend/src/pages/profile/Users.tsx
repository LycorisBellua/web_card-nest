import { useUser } from 'context/useUser';
import { ScrollablePage } from 'components/general/Scrollable';
import UserBtn from 'components/btn/user_btn/UserBtn';

function Users() {
  const { users } = useUser();

  return (
    <ScrollablePage>
      <h1>Users</h1>
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
