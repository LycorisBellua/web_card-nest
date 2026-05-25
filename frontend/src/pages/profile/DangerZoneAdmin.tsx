import { useState } from 'react';
import type { User, OtherUserOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import { CanDisciplineThisUser } from 'functions/Ranks';
import { ChangeRankRequest, DeleteUserRequest } from 'functions/Requests';
import { BtnDanger, BtnAccent } from 'components/btn/Btn';
import Modal from 'components/misc/Modal';

interface Props {
  otherUser: OtherUserOrGuest;
  setOtherUser: (e: OtherUserOrGuest) => void;
}

function DangerZoneAdmin({ otherUser, setOtherUser }: Props) {
  const { user, setUser } = useUser();
  const [isDownrankModalOpen, setIsDownrankModalOpen] = useState(false);
  const [isUprankModalOpen, setIsUprankModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [error, setError] = useState('');

  if (
    !user ||
    !otherUser ||
    user.rank.toLowerCase() != 'admin' ||
    !CanDisciplineThisUser(user, otherUser)
  )
    return <></>;

  function closeModals() {
    setIsDownrankModalOpen(false);
    setIsUprankModalOpen(false);
    setIsDeletionModalOpen(false);
    setError('');
  }

  async function handleDownrank() {
    closeModals();
    try {
      const newRank = 'user';
      const newAccessToken = await ChangeRankRequest(
        user!.accessToken,
        otherUser!.id,
        newRank,
      );
      if (!newAccessToken.length) {
        setError('Error occurred');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: newAccessToken }) as User);
      otherUser!.rank = newRank;
      setOtherUser(otherUser);
    } catch {
      setError('Error occurred');
    }
  }

  async function handleUprank() {
    closeModals();
    try {
      const newRank = 'moderator';
      const newAccessToken = await ChangeRankRequest(
        user!.accessToken,
        otherUser!.id,
        newRank,
      );
      if (!newAccessToken.length) {
        setError('Error occurred');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: newAccessToken }) as User);
      otherUser!.rank = newRank;
      setOtherUser(otherUser);
    } catch {
      setError('Error occurred');
    }
  }

  async function handleDelete() {
    closeModals();
    try {
      const newAccessToken = await DeleteUserRequest(
        user!.accessToken,
        otherUser!.id,
      );
      if (!newAccessToken.length) {
        setError('Error occurred');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: newAccessToken }) as User);
      setOtherUser(null);
      window.location.href = '/users';
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
