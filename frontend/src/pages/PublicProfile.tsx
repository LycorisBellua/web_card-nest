import { useParams } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { GetDate } from 'functions/Time';
import { IsLoggedIn } from 'functions/Ranks';
import NotFound from 'pages/NotFound';
import { ScrollablePage } from 'components/general/Scrollable';
import { AvatarBig } from 'components/Avatar';

function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { users } = useUser();

  if (!IsLoggedIn()) return <NotFound />;

  // TODO: Fetch user data using `username`. In the meantime, use the context.
  const user = users.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  //
  if (!user) return <NotFound />;

  return (
    <ScrollablePage>
      <AvatarBig src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <p>Username: {user.username}</p>
      <p>Rank: {user.rank}</p>
      <p>Registered: {GetDate(user.registered)}</p>
      <p>Description: {user.description}</p>
    </ScrollablePage>
  );
}

export default PublicProfile;
