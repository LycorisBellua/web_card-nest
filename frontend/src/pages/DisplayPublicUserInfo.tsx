import type { User } from 'context/Types';
import { GetDate } from 'functions/Time';
import { AvatarBig } from 'components/Avatar';

function DisplayPublicUserInfo({ user }: { user: NonNullable<User> }) {
  return (
    <div>
      <AvatarBig src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <p>Username: {user.username}</p>
      <p>Rank: {user.rank}</p>
      <p>Registered: {GetDate(user.registered)}</p>
      <p>Description: {user.description}</p>
    </div>
  );
}

export default DisplayPublicUserInfo;
