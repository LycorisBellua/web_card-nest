import { useEffect, useRef, useState } from 'react';
import { useUser } from 'context/useUser';
import type { User } from 'context/Types';
import NotFound from 'pages/NotFound';
import DisplayPublicUserInfo from 'pages/DisplayPublicUserInfo';
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

type PendingChanges = {
  avatar?: File | '';
  username?: string;
  description?: string;
  email?: string;
};

function PrivateProfile() {
  const { user } = useUser();

  if (!IsLoggedIn()) return <NotFound />;

  /*
  TODO
  - [x] Display all public info at the top of the page.
  - [ ] Display an "Auth Data" section showing the email, unverified email, a 
  button to verify the email, a way to modify the password, and a button to 
  log out.

  - [ ] Editing form:
        - Add a button to display the editing form.
        - It has a save button at the end, which sends one request for all 
        modified fields (not all fields, just the modified ones). The email 
        verification and password modification are already handled in Auth Data.
        - You need to see the changes before clicking on Save. These are in a 
        "pending" block.

   - [ ] A button to delete the account.
  */

  return (
    <ScrollablePage>
      <DisplayPublicUserInfo user={user as NonNullable<User>} />
      <hr />
      <EditAuthData user={user as NonNullable<User>} />
      <hr />
      <EditOtherData user={user as NonNullable<User>} />
      <hr />
      <DeleteAccount user={user as NonNullable<User>} />
    </ScrollablePage>
  );
}

// -----------------------------------------------------------------------------
// Auth Data
// -----------------------------------------------------------------------------

function EditAuthData({ user }: { user: NonNullable<User> }) {
  return (
    <div>
      <h2>Auth Data</h2>
      <p>Email: {user.email ?? '[None / Pending verification]'}</p>
      {user.unverifiedEmail && <VerifyEmail user={user} />}
      <UpdatePassword user={user} />
      <Logout />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Edit other data (toggled form)
// -----------------------------------------------------------------------------

function EditOtherData({ user }: { user: NonNullable<User> }) {
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
      <Button onClick={() => setOpen((o) => !o)}>
        {open ? 'Close editor' : 'Edit profile'}
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

// -----------------------------------------------------------------------------
// Delete account
// -----------------------------------------------------------------------------

function DeleteAccount({ user }: { user: NonNullable<User> }) {
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

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

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
        <Button onClick={() => void handleVerifyEmail()}>Verify🖊️</Button>
      </div>
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
      {message && <p>{message}</p>}
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

function Logout() {
  const { setUser } = useUser();
  const [error, setError] = useState('');

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) {
        setError(`Logout failed: ${res.statusText}`);
        return;
      }
      setUser(null);
      window.location.href = '/';
    } catch {
      setError('An error occurred during logout.');
    }
  }

  return (
    <div>
      <Button onClick={() => void handleLogout()}>Log out</Button>
      {error && <p>{error}</p>}
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

export default PrivateProfile;
