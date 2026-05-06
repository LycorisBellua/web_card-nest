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
import BtnDefault from 'components/btn/BtnDefault';
import { AvatarBig } from 'components/btn/user_btn/Avatar';

type PendingChanges = {
  avatar?: File | '';
  username?: string;
  description?: string;
  email?: string;
  password?: string;
};

function EditProfile({ user }: { user: NonNullable<User> }) {
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

    const avatar = changes.avatar;
    const username =
      changes.username !== undefined
        ? sanitizeUsername(changes.username)
        : undefined;
    const description =
      changes.description !== undefined
        ? sanitizeDescription(changes.description)
        : undefined;
    const email =
      changes.email !== undefined ? sanitizeEmail(changes.email) : undefined;
    const password = changes.password;

    if (avatar instanceof File) errors.push(...(await validateAvatar(avatar)));
    if (username !== undefined) errors.push(...validateUsername(username));
    if (description !== undefined)
      errors.push(...validateDescription(description));
    if (email !== undefined) errors.push(...validateEmail(email));
    if (password !== undefined)
      errors.push(...validatePassword(password, user.username, user.email));

    if (errors.length > 0) {
      setGlobalErrors(errors);
      return;
    }

    const requests: Promise<Response>[] = [];

    const body: Record<string, unknown> = {};
    if (avatar !== undefined) {
      if (avatar === '') {
        body.avatar = '';
      } else {
        body.avatar = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(',')[1]);
          reader.onerror = () =>
            reject(new Error('Failed to read avatar file'));
          reader.readAsDataURL(avatar);
        });
      }
    }
    if (username !== undefined) body.username = username;
    if (description !== undefined) body.description = description;
    if (email !== undefined) body.unverifiedEmail = email;

    if (Object.keys(body).length > 0) {
      requests.push(
        fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
    }

    if (password !== undefined) {
      requests.push(
        fetch(`/api/users/${user.id}/password`, {
          method: 'PATCH',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ password }),
        }),
      );
    }

    const responses = await Promise.all(requests);
    const failed = responses.filter((r) => !r.ok);
    if (failed.length > 0) {
      setGlobalErrors(failed.map((r) => `Error ${r.status}: ${r.statusText}`));
      return;
    }

    if (Object.keys(body).length > 0) {
      const updated = (await responses[0].json()) as Partial<NonNullable<User>>;
      setUser((old) => (old ? { ...old, ...updated } : null));
    }

    setChanges({});
    setSuccessMessage('Changes saved successfully.');
  }

  const hasPendingChanges = Object.keys(changes).length > 0;

  return (
    <div>
      <h2>Edit Profile</h2>
      <UpdateAvatar
        user={user}
        pendingAvatar={changes.avatar}
        onChange={(file) => setChange('avatar', file)}
      />
      <div className="main">
        <UpdateUsername
          user={user}
          pendingValue={changes.username}
          onChange={(val) => setChange('username', val)}
        />
        <UpdateDescription
          user={user}
          pendingValue={changes.description}
          onChange={(val) => setChange('description', val)}
        />
        <UpdateEmail
          user={user}
          pendingValue={changes.email}
          onChange={(val) => setChange('email', val)}
        />
        <UpdatePassword
          user={user}
          onChange={(val) => setChange('password', val)}
        />
        <PendingChangesSummary changes={changes} />
        {globalErrors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
        {successMessage && <p>{successMessage}</p>}
        {hasPendingChanges && (
          <BtnDefault onClick={() => void handleSave()}>Save</BtnDefault>
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
  if (changes.description !== undefined)
    entries.push({
      label: 'Description',
      value: changes.description || '(empty)',
    });
  if (changes.email !== undefined)
    entries.push({ label: 'Email', value: changes.email });
  if (changes.password !== undefined)
    entries.push({ label: 'Password', value: '••••••••' });

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

function UpdateAvatar({
  user,
  pendingAvatar,
  onChange,
}: {
  user: NonNullable<User>;
  pendingAvatar: File | '' | undefined;
  onChange: (f: File | '') => void;
}) {
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (pendingAvatar instanceof File) {
      const url = URL.createObjectURL(pendingAvatar);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [pendingAvatar]);

  const avatarSrc =
    pendingAvatar === ''
      ? undefined
      : pendingAvatar instanceof File
        ? previewUrl
        : user.avatar;

  return (
    <div>
      <AvatarBig src={avatarSrc} rank={user.rank} isOnline={user.isOnline} />
      <div className="btn">
        <BtnDefault onClick={() => imgInputRef.current?.click()}>
          Edit
        </BtnDefault>
        <BtnDefault onClick={() => onChange('')}>Remove</BtnDefault>
      </div>
      <input
        name="avatar"
        id="avatar"
        type="file"
        accept=".png"
        ref={imgInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onChange(file);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}

function UpdateUsername({
  user,
  pendingValue,
  onChange,
}: {
  user: NonNullable<User>;
  pendingValue: string | undefined;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(pendingValue ?? '');

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  const displayed = edit ? value : (pendingValue ?? user.username);

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
            displayed
          )}
        </p>
        <BtnDefault onClick={() => setEdit((e) => !e)}>
          {edit ? 'Done' : 'Edit'}
        </BtnDefault>
      </div>
    </div>
  );
}

function UpdateDescription({
  user,
  pendingValue,
  onChange,
}: {
  user: NonNullable<User>;
  pendingValue: string | undefined;
  onChange: (v: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(pendingValue ?? '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  const displayed = edit ? value : (pendingValue ?? user.description);

  return (
    <>
      <div>
        <p>Description:</p>
        <BtnDefault onClick={() => setEdit((e) => !e)}>
          {edit ? 'Done' : 'Edit'}
        </BtnDefault>
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
          <p>{displayed}</p>
        )}
      </div>
    </>
  );
}

function UpdateEmail({
  user,
  pendingValue,
  onChange,
}: {
  user: NonNullable<User>;
  pendingValue: string | undefined;
  onChange: (v: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(pendingValue ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  const displayed = edit ? value : (pendingValue ?? user.email);

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
            displayed
          )}
        </p>
        <BtnDefault onClick={() => setEdit((e) => !e)}>
          {edit ? 'Done' : 'Edit'}
        </BtnDefault>
      </div>
    </div>
  );
}

function UpdatePassword({
  user,
  onChange,
}: {
  user: NonNullable<User>;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  function handleDone() {
    if (!edit) {
      setEdit(true);
      return;
    }

    setErrors([]);
    const localErrors: string[] = [];
    const sanitized = sanitizePassword(value);
    localErrors.push(...validatePassword(sanitized, user.username, user.email));
    if (value !== confirmValue) localErrors.push("Passwords don't match.");
    if (localErrors.length > 0) {
      setErrors(localErrors);
      return;
    }

    onChange(sanitized);
    setEdit(false);
  }

  return (
    <div>
      <div>
        <p>Password: ••••••••</p>
        <BtnDefault onClick={handleDone}>{edit ? 'Done' : 'Edit'}</BtnDefault>
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
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EditProfile;
