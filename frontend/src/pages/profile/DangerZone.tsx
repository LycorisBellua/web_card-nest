import { useState } from 'react';
import { useUser } from 'context/useUser';
import type { User } from 'context/Types';
import { BtnDanger } from 'components/btn/Btn';
import Modal from 'components/misc/Modal';

function DangerZone({ user }: { user: NonNullable<User> }) {
  const { setUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError('');
  }

  async function handleDelete() {
    closeModal();
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
      <BtnDanger onClick={() => openModal()}>Delete account</BtnDanger>
      {error && <p>{error}</p>}
      <Modal
        isOpen={isModalOpen}
        onCancel={() => closeModal()}
        onConfirm={() => void handleDelete()}
        title="Account Deletion"
        textMain="Are you sure you want to permanently delete your account? This cannot be undone."
        textCancel="Cancel"
        textConfirm="Delete"
      />
    </div>
  );
}

export default DangerZone;
