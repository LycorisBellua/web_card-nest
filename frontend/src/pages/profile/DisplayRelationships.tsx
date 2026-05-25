import { useUser } from 'context/useUser';
import type { OtherUserOrGuest } from 'context/Types';
import UserBtn from 'components/btn/UserBtn';

export function DisplaySelfFriendList() {
  const { user, friends } = useUser();

  if (!user) return <></>;

  return (
    <div>
      <h2>Friends</h2>
      {!friends.length ? (
        <p>Empty friend list</p>
      ) : (
        friends.map((e) => (
          <UserBtn
            key={e.id}
            user={e as OtherUserOrGuest}
            path={`/user/${e.username}`}
          />
        ))
      )}
    </div>
  );
}

export function DisplayPublicFriendList({ user }: { user: OtherUserOrGuest }) {
  if (!user) return <></>;

  return (
    <div>
      <h2>Friends</h2>
      {!user.friends.length ? (
        <p>Empty friend list</p>
      ) : (
        user.friends.map((e) => (
          <UserBtn
            key={e.id}
            user={e as OtherUserOrGuest}
            path={`/user/${e.username}`}
          />
        ))
      )}
    </div>
  );
}
