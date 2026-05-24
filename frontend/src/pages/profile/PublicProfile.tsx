import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { User, OtherUserOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import {
  RefreshTokenRequest,
  FetchSelfBlockedListRequest,
  FetchSelfFriendListRequest,
  FetchSelfSentListRequest,
  FetchSelfReceivedListRequest,
  RemoveFriendshipRequest,
  AskFriendshipRequest,
  CancelFriendshipRequest,
  AcceptFriendshipRequest,
  RejectFriendshipRequest,
  UnblockingRequest,
  BlockingRequest,
} from 'functions/Requests';
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
  const {
    user,
    setUser,
    blocked,
    setBlocked,
    friends,
    setFriends,
    sentFriends,
    setSentFriends,
    receivedFriends,
    setReceivedFriends,
  } = useUser();
  const [otherUser, setOtherUser] = useState<OtherUserOrGuest>(null);
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
        } as OtherUserOrGuest);
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

  const is_friend = friends.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  const is_blocked = blocked.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  const friend_request_sent = sentFriends.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );
  const friend_request_received = receivedFriends.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase(),
  );

  function closeModals() {
    setIsFriendModalOpen(false);
    setIsBlockModalOpen(false);
    setError('');
  }

  function clickFriend() {
    if (is_friend) {
      void removeFriendship();
    } else if (friend_request_sent) {
      void cancelFriendRequest();
    } else if (friend_request_received) {
      void rejectFriendRequest();
    } else if (is_blocked) {
      setIsFriendModalOpen(true);
    } else {
      void sendFriendRequest();
    }
  }

  function clickBlock() {
    if (is_blocked) {
      void unblockUser();
    } else if (is_friend) {
      setIsBlockModalOpen(true);
    } else {
      void blockUser();
    }
  }

  async function removeFriendship() {
    try {
      let accessToken = await RemoveFriendshipRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (accessToken.length) {
        const data = await FetchSelfBlockedListRequest(accessToken);
        accessToken = data.accessToken;
        if (accessToken.length) {
          setFriends(data.users);
        }
      }
      if (!accessToken.length) {
        setError('Error occurred with "Remove Friendship"');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred with "Remove Friendship"');
    }
  }

  async function sendFriendRequest() {
    try {
      let accessToken = await AskFriendshipRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (accessToken.length) {
        const data = await FetchSelfSentListRequest(accessToken);
        accessToken = data.accessToken;
        if (accessToken.length) {
          setSentFriends(data.users);
        }
      }
      if (!accessToken.length) {
        setError('Error occurred with "Send Friend Request"');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred with "Send Friend Request"');
    }
  }

  async function cancelFriendRequest() {
    try {
      let accessToken = await CancelFriendshipRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (accessToken.length) {
        const data = await FetchSelfSentListRequest(accessToken);
        accessToken = data.accessToken;
        if (accessToken.length) {
          setSentFriends(data.users);
        }
      }
      if (!accessToken.length) {
        setError('Error occurred with "Cancel Friend Request"');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred with "Cancel Friend Request"');
    }
  }

  async function acceptFriendRequest() {
    try {
      let accessToken = await AcceptFriendshipRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (accessToken.length) {
        const data1 = await FetchSelfReceivedListRequest(accessToken);
        accessToken = data1.accessToken;
        if (accessToken.length) {
          setReceivedFriends(data1.users);
          const data2 = await FetchSelfFriendListRequest(accessToken);
          accessToken = data2.accessToken;
          if (accessToken.length) {
            setFriends(data2.users);
          }
        }
      }
      if (!accessToken.length) {
        setError('Error occurred with "Accept Friend Request"');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred with "Accept Friend Request"');
    }
  }

  async function rejectFriendRequest() {
    try {
      let accessToken = await RejectFriendshipRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (accessToken.length) {
        let data = await FetchSelfReceivedListRequest(accessToken);
        accessToken = data.accessToken;
        if (accessToken.length) {
          setReceivedFriends(data.users);
          data = await FetchSelfFriendListRequest(accessToken);
          accessToken = data.accessToken;
          if (accessToken.length) {
            setFriends(data.users);
          }
        }
      }
      if (!accessToken.length) {
        setError('Error occurred with "Reject Friend Request"');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred with "Reject Friend Request"');
    }
  }

  async function unblockUser() {
    try {
      let accessToken = await UnblockingRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (accessToken.length) {
        const data = await FetchSelfBlockedListRequest(accessToken);
        accessToken = data.accessToken;
        if (accessToken.length) {
          setBlocked(data.users);
        }
      }
      if (!accessToken.length) {
        setError('Error occurred with "Unblock User"');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred with "Unblock User"');
    }
  }

  async function blockUser() {
    setIsBlockModalOpen(false);
    try {
      let accessToken = await BlockingRequest(user!.accessToken, otherUser!.id);
      if (accessToken.length) {
        let data = await FetchSelfBlockedListRequest(accessToken);
        accessToken = data.accessToken;
        if (accessToken.length) {
          setBlocked(data.users);
          data = await FetchSelfFriendListRequest(accessToken);
          accessToken = data.accessToken;
          if (accessToken.length) {
            setFriends(data.users);
            data = await FetchSelfSentListRequest(accessToken);
            accessToken = data.accessToken;
            if (accessToken.length) {
              setSentFriends(data.users);
              data = await FetchSelfReceivedListRequest(accessToken);
              accessToken = data.accessToken;
              if (accessToken.length) {
                setReceivedFriends(data.users);
              }
            }
          }
        }
      }
      if (!accessToken.length) {
        setError('Error occurred with "Block User"');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred with "Block User"');
    }
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
                : friend_request_received
                  ? 'Reject Friend Request'
                  : 'Send Friend Request'}
          </BtnDefault>
          {friend_request_received && (
            <BtnDefault onClick={() => void acceptFriendRequest()}>
              Accept Friend Request
            </BtnDefault>
          )}
          <BtnDanger onClick={() => clickBlock()}>
            {is_blocked ? 'Unblock' : 'Block'}
          </BtnDanger>
          <ToggleChatTimeout otherUser={otherUser as OtherUserOrGuest} />
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
