import { useUser } from 'context/useUser';
import type { User } from 'context/Types';
import NotFound from 'pages/NotFound';
import {
  DisplayPublicUserInfo,
  DisplayPrivateUserInfo,
} from 'pages/profile/DisplayUserInfo';
import EditProfile from 'pages/profile/EditProfile';
import DangerZone from 'pages/profile/DangerZone';
import { IsLoggedIn } from 'functions/Ranks';
import { ScrollablePage } from 'components/general/Scrollable';

function PrivateProfile() {
  const { user } = useUser();

  if (!IsLoggedIn()) return <NotFound />;

  return (
    <ScrollablePage>
      <DisplayPublicUserInfo user={user as NonNullable<User>} />
      <DisplayPrivateUserInfo user={user as NonNullable<User>} />
      <EditProfile user={user as NonNullable<User>} />
      <DangerZone user={user as NonNullable<User>} />
    </ScrollablePage>
  );
}

export default PrivateProfile;
