import userAvatar from 'assets/default_user.png';
import React, { useEffect, useRef, useState } from 'react';
import Button from 'components/Button';
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

type User = {
  id: string;
  username: string;
  email: string;
  unverifiedEmail: string;
  rank: string;
  description: string;
  avatarURL: string;
  registered: Date;
};

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/users/1', { credentials: 'include' });
        if (!res.ok) {
          setErrors([`Error ${res.status}: ${res.statusText}`]);
          return;
        }
        const data = (await res.json()) as User;
        setUser(data);
      } catch {
        setErrors(['Network error, please try again.']);
      }
    }
    void fetchUser();
  }, []);

  async function updateUserField(
    field: keyof User | 'password',
    value: unknown,
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
    <div>
      <UserInfo user={user} OnUpdateUserField={updateUserField} />
      {errors.length > 0 && <div>{errors}</div>}
    </div>
  );
}

type UserInfoProps = {
  user: User | null;
  OnUpdateUserField: (
    field: keyof User | 'password',
    value: unknown,
  ) => Promise<void>;
};

function UserInfo({ user, OnUpdateUserField }: UserInfoProps) {
  if (!user) return;
  const {
    username,
    email,
    unverifiedEmail,
    rank,
    description,
    avatarURL,
    registered,
  } = user;

  return (
    <div>
      <UpdateUserAvatar
        avatarURL={avatarURL}
        OnUpdateUserField={OnUpdateUserField}
      />
      <div className="main">
        <UpdateUsername
          username={username}
          OnUpdateUserField={OnUpdateUserField}
        />
        <div>
          <p>Rank: {rank}</p>
        </div>
        <div>
          <p>
            Registration date:{' '}
            {user?.registered ? registered.toISOString().slice(0, 10) : 'N/A'}
          </p>
        </div>
        <UpdatePassword
          username={username}
          email={email}
          OnUpdateUserField={OnUpdateUserField}
        />
        <UpdateUserEmail email={email} OnUpdateUserField={OnUpdateUserField} />
        {unverifiedEmail && <VerifyEmail unverifiedEmail={unverifiedEmail} />}
        <UpdateUserDescription
          description={description}
          OnUpdateUserField={OnUpdateUserField}
        />
      </div>
    </div>
  );
}

type UpdateUserAvatarProps = {
  avatarURL: string;
  OnUpdateUserField: (field: keyof User, value: unknown) => Promise<void>;
};

function UpdateUserAvatar({
  avatarURL,
  OnUpdateUserField,
}: UpdateUserAvatarProps) {
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function handleAvatar() {
    imgInputRef.current?.click();
  }

  async function removeAvatar() {
    await OnUpdateUserField('avatarURL', userAvatar);
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
    await OnUpdateUserField('avatarURL', data.url);
    //const imgUrl = URL.createObjectURL(file)
    //await OnUpdateUserField("avatarURL", imgUrl)
    setErrors([]);
  }

  return (
    <div>
      <img src={avatarURL ? avatarURL : userAvatar} alt="avatar" />
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

type UpdateUsernameProps = {
  username: string;
  OnUpdateUserField: (field: keyof User, value: unknown) => Promise<void>;
};

function UpdateUsername({ username, OnUpdateUserField }: UpdateUsernameProps) {
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
    await OnUpdateUserField('username', username);
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
            username
          )}
        </p>
        <Button onClick={edit ? handleSaving : () => setEdit(true)}>
          {edit ? 'save' : '🖊️'}
        </Button>
      </div>
      {errors &&
        errors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
    </div>
  );
}

type UpdatePasswordProps = {
  username: string;
  email: string;
  OnUpdateUserField: (
    field: keyof User | 'password',
    value: unknown,
  ) => Promise<void>;
};

function UpdatePassword({
  username,
  email,
  OnUpdateUserField,
}: UpdatePasswordProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (edit) {
      inputRef.current?.focus();
    }
  }, [edit]);
  async function handleSaving() {
    setErrors([]);
    if (!value || !confirm) setErrors(["'Please fill all fields."]);
    const password = sanitizePassword(value);
    const allErrors = [
      ...validatePassword(password, username, email),
      ...(confirm !== password ? ["Passwords don't match."] : []),
    ];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    await OnUpdateUserField('password', password);
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
      {errors &&
        errors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
    </div>
  );
}

type UpdateUserEmailProps = {
  email: string;
  OnUpdateUserField: (field: keyof User, value: unknown) => Promise<void>;
};

function UpdateUserEmail({ email, OnUpdateUserField }: UpdateUserEmailProps) {
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
    await OnUpdateUserField('unverifiedEmail', userEmail);
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
            email
          )}
        </p>
        <Button onClick={edit ? handleSaving : () => setEdit(true)}>
          {edit ? 'save' : '🖊️'}
        </Button>
      </div>
      {errors &&
        errors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
    </div>
  );
}

function VerifyEmail({ unverifiedEmail }: { unverifiedEmail: string }) {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  async function handleVerifyEmail() {
    try {
      const res = await fetch('/api/users/1/verify_email', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ unverifiedEmail: unverifiedEmail }),
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
        <p>Unverified email: {unverifiedEmail}</p>
        <Button onClick={() => void handleVerifyEmail()}>Verify🖊️</Button>
      </div>
      {errors &&
        errors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
      {message && <p>{message}</p>}
    </div>
  );
}

type UpdateUserDescription = {
  description: string;
  OnUpdateUserField: (field: keyof User, value: unknown) => Promise<void>;
};

function UpdateUserDescription({
  description,
  OnUpdateUserField,
}: UpdateUserDescription) {
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
    await OnUpdateUserField('description', userDesc);
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
          <p>{description}</p>
        )}
      </div>
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
    </>
  );
}

export default Profile;
