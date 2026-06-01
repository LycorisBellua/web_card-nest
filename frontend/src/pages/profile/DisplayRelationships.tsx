import { useUser } from 'context/useUser';
import type { OtherUserOrGuest } from 'context/Types';
import UserBtn from 'components/btn/UserBtn';

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

export function DisplaySelfBlockedList() {
  const { user, blocked } = useUser();

  if (!user || !blocked.length) return <></>;

  return (
    <div>
      <h2>Blocked users</h2>
      {blocked.map((e) => (
        <UserBtn
          key={e.id}
          user={e as OtherUserOrGuest}
          path={`/user/${e.username}`}
        />
      ))}
    </div>
  );
}

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

export function DisplaySelfSentList() {
  const { user, sentFriends } = useUser();

  if (!user || !sentFriends.length) return <></>;

  return (
    <div>
      <h2>Sent friend requests</h2>
      {sentFriends.map((e) => (
        <UserBtn
          key={e.id}
          user={e as OtherUserOrGuest}
          path={`/user/${e.username}`}
        />
      ))}
    </div>
  );
}

export function DisplaySelfReceivedList() {
  const { user, receivedFriends } = useUser();

  if (!user || !receivedFriends.length) return <></>;

  return (
    <div>
      <h2>Received friend requests</h2>
      {receivedFriends.map((e) => (
        <UserBtn
          key={e.id}
          user={e as OtherUserOrGuest}
          path={`/user/${e.username}`}
        />
      ))}
    </div>
  );
}
