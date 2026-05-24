import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { User, UserLimitedOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import { RefreshTokenRequest } from 'functions/Requests';
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
  const { user, setUser, friends } = useUser();
  const [otherUser, setOtherUser] = useState<UserLimitedOrGuest>(null);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const noAccess = !user || user.rank.toLowerCase() == 'pending';
  const isGuest = !username || username.toLowerCase() == 'guest';

  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        if (
          username &&
          otherUser &&
          username.toLowerCase() != otherUser.username.toLowerCase()
        ) {
          await navigate(`/user/${otherUser.username}`);
          return;
        }
        if (noAccess || isGuest) return;
        if (
          otherUser &&
          username.toLowerCase() === otherUser.username.toLowerCase()
        )
          return;
        let res = await fetch(`/api/user/username/${username}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status != 401) return;
          const accessToken = await RefreshTokenRequest(user.accessToken);
          if (!accessToken.length) return;
          setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
          res = await fetch(`/api/user/username/${username}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
            signal: controller.signal,
          });
          if (!res.ok) return;
        }
        const data = (await res.json()) as {
          id: string;
          username: string;
          avatar: string;
          rank: string;
          date: Date;
          desc: string;
          email: string;
          email_unverified: string;
        };
        setOtherUser({
          id: data.id,
          username: data.username,
          avatar: data.avatar,
          rank: data.rank,
          registered: new Date(data.date),
          desc: data.desc,
          isOnline: false,
        } as UserLimitedOrGuest);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (e instanceof Error && e.message.includes('abort')) return;
        setOtherUser(null);
      }
    };

    void fetchUser();
    return () => controller.abort();
  }, [user, setUser, isGuest, noAccess, username, otherUser, navigate]);

  if (noAccess) return <NotFound />;
  else if (isGuest) return <GuestProfile />;
  else if (!otherUser) return <NotFound />;

  // TODO
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
      {user.id != otherUser.id && (
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
          <EditProfileMod
            otherUser={otherUser}
            setOtherUser={(e) => setOtherUser(e)}
          />
          <DangerZoneAdmin otherUser={otherUser} />
        </div>
      )}
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
