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
import { ScrollablePage } from 'components/general/Scrollable';
import Button from 'components/Button';
import { AvatarBig } from 'components/Avatar';

type UpdateUserFieldHandler = (
  field: keyof NonNullable<User> | 'password',
  value: unknown,
) => Promise<void>;

type UserInfoProps = {
  user: NonNullable<User>;
  onUpdateUserField: UpdateUserFieldHandler;
};

function Profile() {
  const { user, setUser } = useUser();

  if (!user) return <NotFound />;

  async function updateUserField(
    ...[field, value]: Parameters<UpdateUserFieldHandler>
  ) {
    if (!value) return;
    await fetch('/api/users/1', {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (field !== 'password') {
      setUser((old) => (old ? { ...old, [field]: value } : null));
    }
  }

  return (
    <ScrollablePage>
      <UserInfo user={user} onUpdateUserField={updateUserField} />
    </ScrollablePage>
  );
}

function UserInfo({ user, onUpdateUserField }: UserInfoProps) {
  return (
    <div>
      <UpdateUserAvatar user={user} onUpdateUserField={onUpdateUserField} />
      <div className="main">
        <UpdateUsername user={user} onUpdateUserField={onUpdateUserField} />
        <div>
          <p>Rank: {user.rank}</p>
        </div>
        <div>
          <p>
            Registration date:{' '}
            {user.registered?.toISOString().slice(0, 10) ?? 'N/A'}
          </p>
        </div>
        <UpdatePassword user={user} onUpdateUserField={onUpdateUserField} />
        <UpdateUserEmail user={user} onUpdateUserField={onUpdateUserField} />
        {user.unverifiedEmail && <VerifyEmail user={user} />}
        <UpdateUserDescription user={user} onUpdateUserField={onUpdateUserField} />
      </div>
    </div>
  );
}

function UpdateUserAvatar({ user, onUpdateUserField }: UserInfoProps) {
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function handleAvatar() {
    imgInputRef.current?.click();
  }

  async function removeAvatar() {
    await onUpdateUserField('avatar', '');
  }

  async function handleUpdateAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allErrors = [...(await validateAvatar(file))];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    const avatarForm = new FormData();
    avatarForm.append('avatar', file);
    const res = await fetch('/api/upload/avatar', {
      method: 'POST',
      body: avatarForm,
    });
    if (!res.ok) return;
    const data = (await res.json()) as { url: string };
    await onUpdateUserField('avatar', data.url);
    setErrors([]);
  }

  return (
    <div>
      <AvatarBig src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <div className="btn">
        <Button onClick={handleAvatar}>Edit🖊️</Button>
        <Button onClick={() => void removeAvatar()}>Remove🗑️</Button>
      </div>
      <input
        name="avatar"
        id="avatar"
        type="file"
        accept=".png"
        ref={imgInputRef}
        onChange={(e) => void handleUpdateAvatar(e)}
      />
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
    </div>
  );
}

function UpdateUsername({ user, onUpdateUserField }: UserInfoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  async function handleSaving() {
    const username = sanitizeUsername(value);
    if (!username) {
      setErrors([]);
      setEdit(false);
      return;
    }
    const allErrors = [...validateUsername(username)];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      setValue('');
      return;
    }
    await onUpdateUserField('username', username);
    setEdit(false);
    setErrors([]);
  }

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
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
            />
          ) : (
            user.username
          )}
        </p>
        <Button onClick={edit ? handleSaving : () => setEdit(true)}>
          {edit ? 'save' : '🖊️'}
        </Button>
      </div>
      {errors.map((err, i) => <div key={i}>{err}</div>)}
    </div>
  );
}

function UpdatePassword({ user, onUpdateUserField }: UserInfoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  async function handleSaving() {
    setErrors([]);
    if (!value || !confirm) {
      setErrors(["'Please fill all fields."]);
      return;
    }
    const password = sanitizePassword(value);
    const allErrors = [
      ...validatePassword(password, user.username, user.email),
      ...(confirm !== password ? ["Passwords don't match."] : []),
    ];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    await onUpdateUserField('password', password);
    setEdit(false);
    setValue('');
    setConfirm('');
  }

  return (
    <div>
      <div>
        <p>Password: ********</p>
        <Button onClick={edit ? handleSaving : () => setEdit(true)}>
          {edit ? 'save' : '🖊️'}
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
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      )}
      {errors.map((err, i) => <div key={i}>{err}</div>)}
    </div>
  );
}

function UpdateUserEmail({ user, onUpdateUserField }: UserInfoProps) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  async function handleSaving() {
    const userEmail = sanitizeEmail(value);
    if (!userEmail) {
      setErrors([]);
      setEdit(false);
      return;
    }
    const allErrors = [...validateEmail(userEmail)];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      setValue('');
      return;
    }
    await onUpdateUserField('unverifiedEmail', userEmail);
    setEdit(false);
    setErrors([]);
  }

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
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
            />
          ) : (
            user.email
          )}
        </p>
        <Button onClick={edit ? handleSaving : () => setEdit(true)}>
          {edit ? 'save' : '🖊️'}
        </Button>
      </div>
      {errors.map((err, i) => <div key={i}>{err}</div>)}
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
      setErrors(['Error occured']);
    }
  }

  return (
    <div>
      <div>
        <p>Unverified email: {user.unverifiedEmail}</p>
        <Button onClick={() => void handleVerifyEmail()}>Verify🖊️</Button>
      </div>
      {errors.map((err, i) => <div key={i}>{err}</div>)}
      {message && <p>{message}</p>}
    </div>
  );
}

function UpdateUserDescription({ user, onUpdateUserField }: UserInfoProps) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  async function handleSaving() {
    const userDesc = sanitizeDescription(value);
    const allErrors = [...validateDescription(userDesc)];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    await onUpdateUserField('description', userDesc);
    setEdit(false);
    setValue('');
    setErrors([]);
  }

  return (
    <>
      <div>
        <p>Description:</p>
        <Button onClick={edit ? handleSaving : () => setEdit(true)}>
          {edit ? 'save' : '🖊️'}
        </Button>
      </div>
      <div>
        {edit ? (
          <>
            <textarea
              name="user-description"
              id="user-description"
              rows={4}
              wrap="soft"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></textarea>
            <p>{value.length} / 200</p>
          </>
        ) : (
          <p>{user.description}</p>
        )}
      </div>
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
    </>
  );
}

export default Profile;
