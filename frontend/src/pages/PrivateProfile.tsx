import { useEffect, useRef, useState } from 'react';
import { useUser } from 'context/useUser';
import type { User } from 'context/Types';
import NotFound from 'pages/NotFound';
import {
  sanitizeUsername,
  sanitizeEmail,
  sanitizePassword,
  sanitizeDescription,
} from 'functions/UserSanitation';
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateDescription,
  validateAvatar,
} from 'functions/UserValidation';
import { IsLoggedIn } from 'functions/Ranks';
import { ScrollablePage } from 'components/general/Scrollable';
import Button from 'components/Button';
import { AvatarBig } from 'components/Avatar';

type PasswordDraft = { value: string; confirm: string };

type PendingChanges = {
  username?: string;
  email?: string;
  password?: PasswordDraft;
  description?: string;
  avatar?: File | '';
};

type UserInfoProps = {
  user: NonNullable<User>;
};

function PrivateProfile() {
  const { user } = useUser();

  if (!IsLoggedIn()) return <NotFound />;

  return (
    <ScrollablePage>
      <UserInfo user={user} />
    </ScrollablePage>
  );
}

function UserInfo({ user }: UserInfoProps) {
  const { setUser } = useUser();
  const [changes, setChanges] = useState<PendingChanges>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  function setChange<K extends keyof PendingChanges>(
    key: K,
    value: PendingChanges[K],
  ) {
    setChanges((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setGlobalErrors([]);
    setSuccessMessage('');
    const errors: string[] = [];

    if (changes.username !== undefined)
      errors.push(...validateUsername(sanitizeUsername(changes.username)));
    if (changes.email !== undefined)
      errors.push(...validateEmail(sanitizeEmail(changes.email)));
    if (changes.password !== undefined) {
      const sanitized = sanitizePassword(changes.password.value);
      errors.push(...validatePassword(sanitized, user.username, user.email));
      if (changes.password.value !== changes.password.confirm)
        errors.push("Passwords don't match.");
    }
    if (changes.description !== undefined)
      errors.push(
        ...validateDescription(sanitizeDescription(changes.description)),
      );
    if (changes.avatar instanceof File)
      errors.push(...(await validateAvatar(changes.avatar)));

    if (errors.length > 0) {
      setGlobalErrors(errors);
      return;
    }

    // --- Password: separate request ---
    if (changes.password !== undefined) {
      const res = await fetch('/api/users/1/password', {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          password: sanitizePassword(changes.password.value),
        }),
      });
      if (!res.ok) {
        setGlobalErrors([`Password update failed: ${res.statusText}`]);
        return;
      }
    }

    // --- All other fields including avatar in one PATCH ---
    const body: Record<string, unknown> = {};
    if (changes.username !== undefined)
      body.username = sanitizeUsername(changes.username);
    if (changes.email !== undefined)
      body.unverifiedEmail = sanitizeEmail(changes.email);
    if (changes.description !== undefined)
      body.description = sanitizeDescription(changes.description);
    if (changes.avatar !== undefined) {
      if (changes.avatar === '') {
        body.avatar = '';
      } else {
        body.avatar = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(',')[1]);
          reader.onerror = () =>
            reject(new Error('Failed to read avatar file'));
          reader.readAsDataURL(changes.avatar as File);
        });
      }
    }

    if (Object.keys(body).length > 0) {
      const res = await fetch('/api/users/1', {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setGlobalErrors([`Error ${res.status}: ${res.statusText}`]);
        return;
      }
      // Use the server response to update user state (avoids storing base64 locally)
      const updated = (await res.json()) as Partial<NonNullable<User>>;
      setUser((old) => (old ? { ...old, ...updated } : null));
    }

    setChanges({});
    setSuccessMessage('Changes saved successfully.');
  }

  return (
    <div>
      <UpdateUserAvatar
        user={user}
        onChange={(file) => setChange('avatar', file)}
      />
      <div className="main">
        <UpdateUsername
          user={user}
          onChange={(val) => setChange('username', val)}
        />
        <div>
          <p>Rank: {user.rank}</p>
        </div>
        <div>
          <p>
            Registration date:{' '}
            {user.registered?.toISOString().slice(0, 10) ?? 'N/A'}
          </p>
        </div>
        <UpdatePassword onChange={(val) => setChange('password', val)} />
        <UpdateUserEmail
          user={user}
          onChange={(val) => setChange('email', val)}
        />
        {user.unverifiedEmail && <VerifyEmail user={user} />}
        <UpdateUserDescription
          user={user}
          onChange={(val) => setChange('description', val)}
        />

        <PendingChangesSummary changes={changes} />
        {globalErrors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
        {successMessage && <p>{successMessage}</p>}
        {Object.keys(changes).length > 0 && (
          <Button onClick={() => void handleSave()}>Save</Button>
        )}
      </div>
    </div>
  );
}

function PendingChangesSummary({ changes }: { changes: PendingChanges }) {
  const entries: { label: string; value: string }[] = [];

  if (changes.avatar !== undefined)
    entries.push({
      label: 'Avatar',
      value: changes.avatar === '' ? 'Removed' : changes.avatar.name,
    });
  if (changes.username !== undefined)
    entries.push({ label: 'Username', value: changes.username });
  if (changes.email !== undefined)
    entries.push({ label: 'Email', value: changes.email });
  if (changes.password !== undefined)
    entries.push({ label: 'Password', value: '••••••••' });
  if (changes.description !== undefined)
    entries.push({
      label: 'Description',
      value: changes.description || '(empty)',
    });

  if (entries.length === 0) return null;

  return (
    <div>
      <p>Pending changes:</p>
      <ul>
        {entries.map(({ label, value }) => (
          <li key={label}>
            <strong>{label}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpdateUserAvatar({
  user,
  onChange,
}: {
  user: NonNullable<User>;
  onChange: (f: File | '') => void;
}) {
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <AvatarBig src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <div className="btn">
        <Button onClick={() => imgInputRef.current?.click()}>Edit🖊️</Button>
        <Button onClick={() => onChange('')}>Remove🗑️</Button>
      </div>
      <input
        name="avatar"
        id="avatar"
        type="file"
        accept=".png"
        ref={imgInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
    </div>
  );
}

function UpdateUsername({
  user,
  onChange,
}: {
  user: NonNullable<User>;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  return (
    <div>
      <div>
        <p>
          Username:{' '}
          {edit ? (
            <input
              name="username"
              id="username"
              type="text"
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                onChange(e.target.value);
              }}
              autoComplete="off"
            />
          ) : (
            user.username
          )}
        </p>
        <Button onClick={() => setEdit((e) => !e)}>
          {edit ? 'done' : '🖊️'}
        </Button>
      </div>
    </div>
  );
}

function UpdatePassword({
  onChange,
}: {
  onChange: (v: PasswordDraft) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  function update(field: 'value' | 'confirm', v: string) {
    const next: PasswordDraft =
      field === 'value' ? { value: v, confirm } : { value, confirm: v };
    if (field === 'value') setValue(v);
    else setConfirm(v);
    onChange(next);
  }

  return (
    <div>
      <div>
        <p>Password: ********</p>
        <Button onClick={() => setEdit((e) => !e)}>
          {edit ? 'done' : '🖊️'}
        </Button>
      </div>
      {edit && (
        <div>
          <div>
            <label htmlFor="new-password">New password: </label>
            <input
              name="new-password"
              id="new-password"
              type="password"
              ref={inputRef}
              value={value}
              onChange={(e) => update('value', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="new-password-conf">Confirm: </label>
            <input
              name="new-password-conf"
              id="new-password-conf"
              type="password"
              value={confirm}
              onChange={(e) => update('confirm', e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UpdateUserEmail({
  user,
  onChange,
}: {
  user: NonNullable<User>;
  onChange: (v: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  return (
    <div>
      <div>
        <p>
          Email:{' '}
          {edit ? (
            <input
              name="email"
              id="email"
              type="email"
              value={value}
              ref={inputRef}
              onChange={(e) => {
                setValue(e.target.value);
                onChange(e.target.value);
              }}
              autoComplete="off"
            />
          ) : (
            user.email
          )}
        </p>
        <Button onClick={() => setEdit((e) => !e)}>
          {edit ? 'done' : '🖊️'}
        </Button>
      </div>
    </div>
  );
}

function VerifyEmail({ user }: { user: NonNullable<User> }) {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  async function handleVerifyEmail() {
    try {
      const res = await fetch('/api/users/1/verify_email', {
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
        <Button onClick={() => void handleVerifyEmail()}>Verify🖊️</Button>
      </div>
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
      {message && <p>{message}</p>}
    </div>
  );
}

function UpdateUserDescription({
  user,
  onChange,
}: {
  user: NonNullable<User>;
  onChange: (v: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  return (
    <>
      <div>
        <p>Description:</p>
        <Button onClick={() => setEdit((e) => !e)}>
          {edit ? 'done' : '🖊️'}
        </Button>
      </div>
      <div>
        {edit ? (
          <>
            <textarea
              name="user-description"
              id="user-description"
              ref={inputRef}
              rows={4}
              wrap="soft"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                onChange(e.target.value);
              }}
            />
            <p>{value.length} / 200</p>
          </>
        ) : (
          <p>{user.description}</p>
        )}
      </div>
    </>
  );
}

export default PrivateProfile;
