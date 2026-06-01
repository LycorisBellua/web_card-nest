import { useState } from 'react';
import type { User } from 'context/Types';
import { CanDisciplineThisUser, IsAdmin } from 'functions/Ranks';
import { BtnDanger } from 'components/btn/Btn';
import Modal from 'components/misc/Modal';

function DangerZoneAdmin({ user }: { user: NonNullable<User> }) {
  const [isDownrankModalOpen, setIsDownrankModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [error, setError] = useState('');

  if (!CanDisciplineThisUser(user) || !IsAdmin()) return <></>;

  function closeModals() {
    setIsDownrankModalOpen(false);
    setIsDeletionModalOpen(false);
    setError('');
  }

  async function handleDownrank() {
    closeModals();
    try {
      const res = await fetch(`/api/users/${user.id}/rank`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        setError(`Error ${res.status}: ${res.statusText}`);
        return;
      }
      // TODO: Other user is modified. Is the change immediate on the front?
    } catch {
      setError('An error occurred. Please try again.');
    }
  }

  async function handleDelete() {
    closeModals();
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setError(`Error ${res.status}: ${res.statusText}`);
        return;
      }
      // TODO: Other user is deleted. Is the change immediate on the front?
    } catch {
      setError('An error occurred. Please try again.');
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
