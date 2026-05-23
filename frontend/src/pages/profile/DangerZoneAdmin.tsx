import { useState } from 'react';
import type { User, UserLimited } from 'context/Types';
import { useUser } from 'context/useUser';
import { CanDisciplineThisUser } from 'functions/Ranks';
import { ChangeRankRequest, DeleteUserRequest } from 'functions/Requests';
import { BtnDanger } from 'components/btn/Btn';
import Modal from 'components/misc/Modal';

function DangerZoneAdmin({ otherUser }: { otherUser: UserLimited }) {
  const { user, setUser } = useUser();
  const [isDownrankModalOpen, setIsDownrankModalOpen] = useState(false);
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
    setIsDeletionModalOpen(false);
    setError('');
  }

  async function handleDownrank() {
    closeModals();
    // TODO: Test that the request works. Only the admin is allowed here.
    // TODO: Other user is modified. Is the change immediate on the front?
    try {
      const newRank = 'user';
      const newAccessToken = await ChangeRankRequest(
        user.accessToken,
        otherUser.id,
        newRank,
      );
      if (!newAccessToken.length) {
        setError('Error occurred');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: newAccessToken }) as User);
    } catch {
      setError('Error occurred');
    }
  }

  async function handleDelete() {
    closeModals();
    // TODO: Test that the request works. Only the admin is allowed here.
    // TODO: Other user is deleted. Is the change immediate on the front?
    try {
      const newAccessToken = await DeleteUserRequest(
        user.accessToken,
        otherUser.id,
      );
      if (!newAccessToken.length) {
        setError('Error occurred');
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: newAccessToken }) as User);
      window.location.href = '/';
    } catch {
      setError('Error occurred');
    }
  }

  return (
    <div>
      <h2>Danger zone</h2>
      <BtnDanger onClick={() => setIsDownrankModalOpen(true)}>
        Remove Mod Rank
      </BtnDanger>
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
