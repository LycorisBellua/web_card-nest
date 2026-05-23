import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { UserLimitedOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import ToggleChatTimeout from 'pages/profile/ToggleChatTimeout';
import GuestProfile from 'pages/profile/GuestProfile';
import EditProfileMod from 'pages/profile/EditProfileMod';
import DangerZoneAdmin from 'pages/profile/DangerZoneAdmin';
import NotFound from 'pages/NotFound';
import { DisplayPublicUserInfo } from 'pages/profile/DisplayUserInfo';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault, BtnDanger } from 'components/btn/Btn';
import Modal from 'components/misc/Modal';

function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, friends } = useUser();
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.rank.toLowerCase() == 'pending') return <NotFound />;

  if (!username || username.toLowerCase() == 'guest') return <GuestProfile />;

  // TODO: Fetch user data using `username`. In the meantime, use the context.
  const otherUser = null;
  /*const otherUser = users.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  */
  //
  if (!otherUser) return <NotFound />;

  const is_friend = friends.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  const is_blocked = false;
  const friend_request_sent = false;

  function closeModals() {
    setIsFriendModalOpen(false);
    setIsBlockModalOpen(false);
    setError('');
  }

  function clickFriend() {
    if (is_friend) {
      removeFriendship();
    } else if (friend_request_sent) {
      cancelFriendRequest();
    } else if (is_blocked) {
      setIsFriendModalOpen(true);
    } else {
      sendFriendRequest();
    }
  }

  function clickBlock() {
    if (is_blocked) {
      unblockUser();
    } else if (is_friend) {
      setIsBlockModalOpen(true);
    } else {
      blockUser();
    }
  }

  function removeFriendship() {
    // TODO: Request to remove friendship.
  }

  function cancelFriendRequest() {
    // TODO: Request to cancel friend request.
  }

  function sendFriendRequest() {
    // TODO: Request to send friend request.
  }

  function unblockUser() {
    // TODO: Request to unblock other user.
  }

  function blockUser() {
    // TODO: Request to block other user.
  }

  return (
    <ScrollablePage>
      <DisplayPublicUserInfo user={otherUser} />
      <div>
        {is_friend && (
          <Link to={`/chat/${username}`}>
            <BtnDefault>DM</BtnDefault>
          </Link>
        )}
        <BtnDefault onClick={() => clickFriend()}>
          {is_friend
            ? 'Remove Friendship'
            : friend_request_sent
              ? 'Cancel Friend Request'
              : 'Send Friend Request'}
        </BtnDefault>
        <BtnDanger onClick={() => clickBlock()}>
          {is_blocked ? 'Unblock' : 'Block'}
        </BtnDanger>
        <ToggleChatTimeout otherUser={otherUser as UserLimitedOrGuest} />
        {error && <p>{error}</p>}
        <EditProfileMod otherUser={otherUser} />
        <DangerZoneAdmin otherUser={otherUser} />
      </div>
      <Modal
        isOpen={isFriendModalOpen}
        onCancel={() => closeModals()}
        title="Send Friend Request"
        textMain="This user is blocked. To send a friend request, you must first unblock them."
        textCancel="OK"
        textConfirm=""
      />
      <Modal
        isOpen={isBlockModalOpen}
        onCancel={() => closeModals()}
        onConfirm={() => void blockUser()}
        title="Block User"
        textMain="Are you sure you want to block this friend? The friendship will be removed."
        textCancel="Cancel"
        textConfirm="Confirm"
      />
    </ScrollablePage>
  );
}

export default PublicProfile;
