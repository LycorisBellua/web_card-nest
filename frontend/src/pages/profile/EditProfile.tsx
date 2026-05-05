import { useEffect, useRef, useState } from 'react';
import { useUser } from 'context/useUser';
import type { User } from 'context/Types';
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
import Button from 'components/Button';
import { AvatarBig } from 'components/user_btn/Avatar';

type PendingChanges = {
  avatar?: File | '';
  username?: string;
  description?: string;
  email?: string;
};

function EditProfile({ user }: { user: NonNullable<User> }) {
  /*
  TODO
  - [ ] The Save button at the end sends one request for all modified fields. 
  - [ ] Modify the password as a separate request, but which can be sent at the 
        same time.
  - [ ] See the changes before clicking on Save. These are in a "pending" block.
  */

  const { setUser } = useUser();
  const [open, setOpen] = useState(false);
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

    if (changes.avatar instanceof File)
      errors.push(...(await validateAvatar(changes.avatar)));
    if (changes.username !== undefined)
      errors.push(...validateUsername(sanitizeUsername(changes.username)));
    if (changes.description !== undefined)
      errors.push(
        ...validateDescription(sanitizeDescription(changes.description)),
      );
    if (changes.email !== undefined)
      errors.push(...validateEmail(sanitizeEmail(changes.email)));

    if (errors.length > 0) {
      setGlobalErrors(errors);
      return;
    }

    const body: Record<string, unknown> = {};
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
    if (changes.username !== undefined)
      body.username = sanitizeUsername(changes.username);
    if (changes.description !== undefined)
      body.description = sanitizeDescription(changes.description);
    if (changes.email !== undefined)
      body.unverifiedEmail = sanitizeEmail(changes.email);

    if (Object.keys(body).length > 0) {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setGlobalErrors([`Error ${res.status}: ${res.statusText}`]);
        return;
      }
      const updated = (await res.json()) as Partial<NonNullable<User>>;
      setUser((old) => (old ? { ...old, ...updated } : null));
    }

    setChanges({});
    setSuccessMessage('Changes saved successfully.');
  }

  return (
    <div>
      <h2>Edit Profile</h2>
      <Button onClick={() => setOpen((o) => !o)}>
        {open ? 'Close editor' : 'Open editor'}
      </Button>
      {open && (
        <div>
          <UpdateAvatar
            user={user}
            onChange={(file) => setChange('avatar', file)}
          />
          <div className="main">
            <UpdateUsername
              user={user}
              onChange={(val) => setChange('username', val)}
            />
            <UpdateDescription
              user={user}
              onChange={(val) => setChange('description', val)}
            />
            <UpdateEmail
              user={user}
              onChange={(val) => setChange('email', val)}
            />
            <UpdatePassword user={user} />
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
      )}
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
  if (changes.description !== undefined)
    entries.push({
      label: 'Description',
      value: changes.description || '(empty)',
    });
  if (changes.email !== undefined)
    entries.push({ label: 'Email', value: changes.email });

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

function UpdatePassword({ user }: { user: NonNullable<User> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  async function OnEditPassword() {
    if (edit) {
      setGlobalErrors([]);
      setSuccessMessage('');
      const errors: string[] = [];
      const sanitized = sanitizePassword(value);
      errors.push(...validatePassword(sanitized, user.username, user.email));
      if (value !== confirmValue) errors.push("Passwords don't match.");
      if (errors.length > 0) {
        setGlobalErrors(errors);
        return;
      }
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          password: sanitized,
        }),
      });
      if (!res.ok) {
        setGlobalErrors([`Password update failed: ${res.statusText}`]);
        return;
      }
    }
    setEdit(!edit);
  }

  return (
    <div>
      <div>
        <p>Password: ••••••••</p>
        <Button onClick={() => void OnEditPassword()}>
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
              onChange={(e) => setValue(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="new-password-conf">Confirm: </label>
            <input
              name="new-password-conf"
              id="new-password-conf"
              type="password"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {globalErrors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
          {successMessage && <p>{successMessage}</p>}
        </div>
      )}
    </div>
  );
}

function UpdateAvatar({
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

function UpdateDescription({
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

function UpdateEmail({
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

export default EditProfile;
