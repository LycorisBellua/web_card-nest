import type { OtherUserOrGuest } from 'context/Types';
import { DisplayPublicUserInfo } from 'pages/profile/DisplayUserInfo';
import ToggleChatTimeout from 'pages/profile/ToggleChatTimeout';
import { ScrollablePage } from 'components/general/Scrollable';

function GuestProfile() {
  return (
    <ScrollablePage>
      <DisplayPublicUserInfo user={null as OtherUserOrGuest} />
      <div>
        <ToggleChatTimeout otherUser={null as OtherUserOrGuest} />
      </div>
    </ScrollablePage>
  );
}

export default GuestProfile;
