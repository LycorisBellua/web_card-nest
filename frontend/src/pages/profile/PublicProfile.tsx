import { useParams, Link } from 'react-router-dom';
import type { User } from 'context/Types';
import { useUser } from 'context/useUser';
import { IsLoggedIn } from 'functions/Ranks';
import GuestProfile from 'pages/profile/GuestProfile';
import NotFound from 'pages/NotFound';
import { DisplayPublicUserInfo } from 'pages/profile/DisplayUserInfo';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';

function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { friends, users } = useUser();

  if (!IsLoggedIn()) return <NotFound />;

  if (username.toLowerCase() == 'guest')
    return <GuestProfile />;

  // TODO: Fetch user data using `username`. In the meantime, use the context.
  const user = users.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  //
  if (!user) return <NotFound />;
  const is_friend = friends.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );

  return (
    <ScrollablePage>
      <DisplayPublicUserInfo user={user as NonNullable<User>} />
	  <div>
	    {is_friend && <Link to={`/chat/${username}`}><BtnDefault>DM</BtnDefault></Link>}
	  </div>
    </ScrollablePage>
  );
}

export default PublicProfile;
