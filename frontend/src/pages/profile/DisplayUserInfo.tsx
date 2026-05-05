import { useState } from 'react';
import type { User } from 'context/Types';
import { GetDate } from 'functions/Time';
import { AvatarBig } from 'components/user_btn/Avatar';
import Button from 'components/Button';

export function DisplayPublicUserInfo({ user }: { user: NonNullable<User> }) {
  return (
    <div>
      <AvatarBig src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <p>Username: {user.username}</p>
      <p>Rank: {user.rank}</p>
      <p>Registered: {GetDate(user.registered)}</p>
      <p>Description: {user.description}</p>
    </div>
  );
}

export function DisplayPrivateUserInfo({ user }: { user: NonNullable<User> }) {
  return (
    <div>
      <h2>Private Info</h2>
      <p>Email: {user.email ?? '[None / Pending verification]'}</p>
      {user.unverifiedEmail && <VerifyEmail user={user} />}
    </div>
  );
}

function VerifyEmail({ user }: { user: NonNullable<User> }) {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  async function handleVerifyEmail() {
    try {
      const res = await fetch(`/api/users/${user.id}/verify_email`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ unverifiedEmail: user.unverifiedEmail }),
      });
      if (!res.ok) {
        setErrors([`Error ${res.status} : ${res.statusText}`]);
        return;
      }
      setMessage("You'll receive a verification link shortly...");
    } catch {
      setErrors(['Error occurred']);
    }
  }

  return (
    <div>
      <div>
        <p>Unverified email: {user.unverifiedEmail}</p>
        <Button onClick={() => void handleVerifyEmail()}>Verify</Button>
      </div>
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
      {message && <p>{message}</p>}
    </div>
  );
}
