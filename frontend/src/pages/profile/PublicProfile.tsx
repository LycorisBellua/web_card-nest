import { useParams } from 'react-router-dom';
import type { User } from 'context/Types';
import { useUser } from 'context/useUser';
import { IsLoggedIn } from 'functions/Ranks';
import NotFound from 'pages/NotFound';
import { DisplayPublicUserInfo } from 'pages/profile/DisplayUserInfo';
import { ScrollablePage } from 'components/general/Scrollable';

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
      <DisplayPublicUserInfo user={user as NonNullable<User>} />
    </ScrollablePage>
  );
}

export default PublicProfile;
