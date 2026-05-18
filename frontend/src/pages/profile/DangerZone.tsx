import { useState } from 'react';
import { useUser } from 'context/useUser';
import type { User } from 'context/Types';
import { BtnDanger } from 'components/btn/Btn';
import Modal from 'components/misc/Modal';

function DangerZone({ user }: { user: NonNullable<User> }) {
  const { setUser } = useUser();
  const [isDownrankModalOpen, setIsDownrankModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [error, setError] = useState('');

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
      setUser((prev) => ({ ...prev, rank: 'user' }) as User);
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
      setUser(null);
      window.location.href = '/';
    } catch {
      setError('An error occurred. Please try again.');
    }
  }

  return (
    <div>
      <h2>Danger zone</h2>
      {user.rank.toLowerCase() == 'mod' && (
        <BtnDanger onClick={() => setIsDownrankModalOpen(true)}>
          Renounce Mod Rank
        </BtnDanger>
      )}
      <BtnDanger onClick={() => setIsDeletionModalOpen(true)}>
        Delete Account
      </BtnDanger>
      {error && <p>{error}</p>}
      <Modal
        isOpen={isDownrankModalOpen}
        onCancel={() => closeModals()}
        onConfirm={() => void handleDownrank()}
        title="Renounce Mod Rank"
        textMain="Are you sure you don't want to be a mod anymore? If you change your mind, you'll have to ask the admin to give you the rank again."
        textCancel="Cancel"
        textConfirm="Confirm"
      />
      <Modal
        isOpen={isDeletionModalOpen}
        onCancel={() => closeModals()}
        onConfirm={() => void handleDelete()}
        title="Account Deletion"
        textMain="Are you sure you want to permanently delete your account? This cannot be undone."
        textCancel="Cancel"
        textConfirm="Confirm"
      />
    </div>
  );
}

export default DangerZone;
