import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, OtherUserOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import { canDisciplineThisUser } from 'functions/Ranks';
import {
  changeRankRequest,
  deleteUserRequest,
  fetchSelfBlockedListRequest,
  fetchSelfFriendListRequest,
  fetchSelfSentListRequest,
  fetchSelfReceivedListRequest,
} from 'functions/Requests';
import { BtnDanger, BtnAccent } from 'components/btn/Btn';
import Modal from 'components/misc/Modal';

interface Props {
  otherUser: OtherUserOrGuest;
  setOtherUser: (e: OtherUserOrGuest) => void;
}

function DangerZoneAdmin({ otherUser, setOtherUser }: Props) {
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
  const [isDownrankModalOpen, setIsDownrankModalOpen] =
    useState<boolean>(false);
  const [isUprankModalOpen, setIsUprankModalOpen] = useState<boolean>(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] =
    useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  if (
    !user ||
    !otherUser ||
    user.rank.toLowerCase() != 'admin' ||
    !canDisciplineThisUser(user?.rank ?? '', otherUser?.rank ?? '')
  )
    return <></>;

  function closeModals() {
    setIsDownrankModalOpen(false);
    setIsUprankModalOpen(false);
    setIsDeletionModalOpen(false);
    setError('');
  }

  async function updateRelationships(accessToken: string): Promise<string> {
    const inBlocked = blocked.some((u) => u.id === otherUser!.id);
    const inFriends = friends.some((u) => u.id === otherUser!.id);
    const inSentFriends = sentFriends.some((u) => u.id === otherUser!.id);
    const inReceivedFriends = receivedFriends.some(
      (u) => u.id === otherUser!.id,
    );
    if (inBlocked) {
      const data = await fetchSelfBlockedListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setBlocked(data.users);
    } else if (inFriends) {
      const data = await fetchSelfFriendListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setFriends(data.users);
    } else if (inSentFriends) {
      const data = await fetchSelfSentListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setSentFriends(data.users);
    } else if (inReceivedFriends) {
      const data = await fetchSelfReceivedListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setReceivedFriends(data.users);
    }
    return accessToken;
  }

  async function handleDownrank() {
    closeModals();
    try {
      const newRank = 'user';
      let accessToken = await changeRankRequest(
        user!.accessToken,
        otherUser!.id,
        newRank,
      );
      if (!accessToken.length) throw new Error();
      otherUser!.rank = newRank;
      setOtherUser(otherUser);
      accessToken = await updateRelationships(accessToken);
      if (!accessToken.length) throw new Error();
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred');
    }
  }

  async function handleUprank() {
    closeModals();
    try {
      const newRank = 'moderator';
      let accessToken = await changeRankRequest(
        user!.accessToken,
        otherUser!.id,
        newRank,
      );
      if (!accessToken.length) throw new Error();
      otherUser!.rank = newRank;
      setOtherUser(otherUser);
      accessToken = await updateRelationships(accessToken);
      if (!accessToken.length) throw new Error();
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
    } catch {
      setError('Error occurred');
    }
  }

  async function handleDelete() {
    closeModals();
    try {
      let accessToken = await deleteUserRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (!accessToken.length) throw new Error();
      setOtherUser(null);
      accessToken = await updateRelationships(accessToken);
      if (!accessToken.length) throw new Error();
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      await navigate('/users');
    } catch {
      setError('Error occurred');
    }
  }

  return (
    <div>
      <h2>Danger zone</h2>
      {otherUser.rank.toLowerCase() == 'moderator' ? (
        <BtnDanger onClick={() => setIsDownrankModalOpen(true)}>
          Remove Mod Rank
        </BtnDanger>
      ) : otherUser.rank.toLowerCase() == 'user' ? (
        <BtnAccent onClick={() => setIsUprankModalOpen(true)}>
          Give Mod Rank
        </BtnAccent>
      ) : (
        <></>
      )}
      <BtnDanger onClick={() => setIsDeletionModalOpen(true)}>
        Delete Account
      </BtnDanger>
      {error && <p>{error}</p>}
      <Modal
        isOpen={isDownrankModalOpen}
        onCancel={() => closeModals()}
        onConfirm={() => void handleDownrank()}
        title="Remove Mod Rank"
        textMain="Are you sure you don't want this user to be a mod anymore?"
        textCancel="Cancel"
        textConfirm="Confirm"
      />
      <Modal
        isOpen={isUprankModalOpen}
        onCancel={() => closeModals()}
        onConfirm={() => void handleUprank()}
        title="Give Mod Rank"
        textMain="Are you sure you want this user to be a mod?"
        textCancel="Cancel"
        textConfirm="Confirm"
      />
      <Modal
        isOpen={isDeletionModalOpen}
        onCancel={() => closeModals()}
        onConfirm={() => void handleDelete()}
        title="Account Deletion"
        textMain="Are you sure you want to permanently delete the account of this user? This cannot be undone."
        textCancel="Cancel"
        textConfirm="Confirm"
      />
    </div>
  );
}

export default DangerZoneAdmin;
