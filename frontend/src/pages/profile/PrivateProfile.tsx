import { useUser } from 'context/useUser';
import NotFound from 'pages/NotFound';
import {
  DisplayPublicUserInfo,
  DisplayPrivateUserInfo,
} from 'pages/profile/DisplayUserInfo';
import EditProfile from 'pages/profile/EditProfile';
import DangerZone from 'pages/profile/DangerZone';
import { ScrollablePage } from 'components/general/Scrollable';

function PrivateProfile() {
  const { user } = useUser();

  if (!user) return <NotFound />;

  return (
    <ScrollablePage>
      <DisplayPublicUserInfo user={user} />
      <DisplayPrivateUserInfo user={user} />
      <EditProfile user={user} />
      <DangerZone user={user} />
    </ScrollablePage>
  );
}

export default PrivateProfile;
