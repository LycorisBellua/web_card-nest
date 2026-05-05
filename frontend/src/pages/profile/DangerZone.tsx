import { useState } from 'react';
import { useUser } from 'context/useUser';
import type { User } from 'context/Types';
import Button from 'components/Button';

function DangerZone({ user }: { user: NonNullable<User> }) {
  const { setUser } = useUser();
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    if (
      !window.confirm(
        'Are you sure you want to permanently delete your account? This cannot be undone.',
      )
    )
      return;
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
      <Button onClick={() => void handleDelete()}>Delete account</Button>
      {error && <p>{error}</p>}
    </div>
  );
}

export default DangerZone;
