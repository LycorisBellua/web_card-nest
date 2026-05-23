import { useState, useEffect, useRef, useMemo } from 'react';
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
import { RefreshTokenRequest } from 'functions/Requests';
import { BtnDefault, BtnDisabled } from 'components/btn/Btn';
import { AvatarBig } from 'components/btn/Avatar';
import InputField from 'components/misc/InputField';
import TextareaField from 'components/misc/TextareaField';
import Spinner from 'components/misc/Spinner';
import styled from 'styled-components';

type FieldErrors = {
  avatar: string[];
  username: string[];
  desc: string[];
  email: string[];
  newPassword: string[];
  server: string[];
};

const emptyFieldErrors = (): FieldErrors => ({
  avatar: [],
  username: [],
  desc: [],
  email: [],
  newPassword: [],
  server: [],
});

function EditProfile({ user }: { user: NonNullable<User> }) {
  const { setUser } = useUser();
  const [displaySpinner, setDisplaySpinner] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>(emptyFieldErrors());
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [avatar, setAvatar] = useState<File | '' | undefined>(undefined);
  const [username, setUsername] = useState('');
  const [desc, setDesc] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const hasPendingChanges =
    avatar !== undefined ||
    username !== '' ||
    desc !== '' ||
    email !== '' ||
    newPassword !== '';

  async function handleSave() {
    if (!hasPendingChanges || isSaving) return;

    setDisplaySpinner(true);
    setFieldErrors(emptyFieldErrors());
    setSuccessMessage('');
    setIsSaving(true);

    const sanitizedUsername = username !== '' ? sanitizeUsername(username) : '';
    const sanitizedDescription =
      desc !== '' ? sanitizeDescription(desc) : '';
    const sanitizedEmail = email !== '' ? sanitizeEmail(email) : '';
    const sanitizedPassword =
      newPassword !== '' ? sanitizePassword(newPassword) : '';

    const nextErrors: FieldErrors = emptyFieldErrors();
    if (avatar instanceof File)
      nextErrors.avatar.push(...(await validateAvatar(avatar)));
    if (sanitizedUsername !== '')
      nextErrors.username.push(...validateUsername(sanitizedUsername));
    if (sanitizedDescription !== '')
      nextErrors.desc.push(...validateDescription(sanitizedDescription));
    if (sanitizedEmail !== '')
      nextErrors.email.push(...validateEmail(sanitizedEmail));
    if (sanitizedPassword !== '') {
      const tmpEmail = sanitizedEmail ?? user.email ?? user.unverifiedEmail;
      nextErrors.newPassword.push(
        ...validatePassword(sanitizedPassword, user.username, tmpEmail),
      );
    }

    const hasFieldErrors = Object.values(nextErrors).some((e) => e.length > 0);
    if (hasFieldErrors) {
      setDisplaySpinner(false);
      setFieldErrors(nextErrors);
      setIsSaving(false);
      return;
    }

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
    if (sanitizedUsername !== '') body.username = sanitizedUsername;
    if (sanitizedDescription !== '') body.desc = sanitizedDescription;
    if (sanitizedEmail !== '') body.email_unverified = sanitizedEmail;

    try {
      let token = user.accessToken;

      if (Object.keys(body).length > 0) {
        let res = await fetch(`/api/user/update`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (res.status === 401) {
          token = await RefreshTokenRequest(token);
          res = await fetch(`/api/user/update`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
        }

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            message: string;
          } | null;
          setFieldErrors((prev) => ({
            ...prev,
            server: [
              ...prev.server,
              data?.message ?? `Error ${res.status}: ${res.statusText}`,
            ],
          }));
          setIsSaving(false);
          setDisplaySpinner(false);
          return;
        }

        const updated = (await res.json()) as Partial<NonNullable<User>>;
        setUser((old) => (old ? { ...old, ...updated } : null));
      }

      if (sanitizedPassword !== '') {
        let res = await fetch(`/api/auth/password`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: sanitizedPassword,
          }),
        });

        if (res.status === 401) {
          token = await RefreshTokenRequest(token);
          res = await fetch(`/api/auth/password`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              oldPassword: currentPassword,
              newPassword: sanitizedPassword,
            }),
          });
        }

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            message: string;
          } | null;
          setFieldErrors((prev) => ({
            ...prev,
            server: [
              ...prev.server,
              data?.message ?? `Error ${res.status}: ${res.statusText}`,
            ],
          }));
          setIsSaving(false);
          setDisplaySpinner(false);
          return;
        }

        const data = (await res.json()) as { accessToken: string };
        token = data.accessToken;
      }

      setUser((old) => (old ? { ...old, accessToken: token } : null));
    } catch {
      setIsSaving(false);
      setDisplaySpinner(false);
      return;
    }

    setAvatar(undefined);
    setUsername('');
    setDesc('');
    setEmail('');
    setCurrentPassword('');
    setNewPassword('');
    setResetKey((k) => k + 1);
    setSuccessMessage('Changes saved successfully.');
    setIsSaving(false);
    setDisplaySpinner(false);
  }

  const SaveButton = hasPendingChanges && !isSaving ? BtnDefault : BtnDisabled;
  const isVerified = user.rank.toLowerCase() != 'pending';

  return (
    <div>
      <h2>Edit Profile</h2>
      {isVerified && (
        <UpdateAvatar
          key={`avatar-${resetKey}`}
          user={user}
          pendingAvatar={avatar}
          onChange={setAvatar}
          errors={fieldErrors.avatar}
        />
      )}
      <div className="main">
        {isVerified && (
          <>
            <UpdateUsername
              key={`username-${resetKey}`}
              user={user}
              onChange={setUsername}
              errors={fieldErrors.username}
            />
            <UpdateDescription
              key={`desc-${resetKey}`}
              user={user}
              onChange={setDesc}
              errors={fieldErrors.desc}
            />
            <UpdateEmail
              key={`email-${resetKey}`}
              user={user}
              onChange={setEmail}
              errors={fieldErrors.email}
            />
          </>
        )}
        <UpdatePassword
          key={`password-${resetKey}`}
          onChange={setNewPassword}
          onChangeCurrentPassword={setCurrentPassword}
          errors={fieldErrors.newPassword}
        />
        {fieldErrors.server.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
        {successMessage && <p>{successMessage}</p>}
        <SaveButton onClick={() => void handleSave()}>Save</SaveButton>
        {displaySpinner && <Spinner label="Saving..." />}
      </div>
    </div>
  );
}

const HiddenAvatarInput = styled.input`
  display: none;
`;

function UpdateAvatar({
  user,
  pendingAvatar,
  onChange,
  errors,
}: {
  user: NonNullable<User>;
  pendingAvatar: File | '' | undefined;
  onChange: (f: File | '') => void;
  errors: string[];
}) {
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!(pendingAvatar instanceof File)) return null;
    return URL.createObjectURL(pendingAvatar);
  }, [pendingAvatar]);

  useEffect(() => {
    if (previewUrl) return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const avatarSrc =
    pendingAvatar === ''
      ? undefined
      : pendingAvatar instanceof File
        ? previewUrl
        : user.avatar;

  return (
    <div>
      <AvatarBig
        src={avatarSrc ?? ''}
        rank={user.rank}
        isOnline={user.isOnline}
      />
      <div className="btn">
        <BtnDefault onClick={() => imgInputRef.current?.click()}>
          Edit
        </BtnDefault>
        <BtnDefault onClick={() => onChange('')}>Remove</BtnDefault>
      </div>
      {errors.map((err) => (
        <p key={err}>{err}</p>
      ))}
      <HiddenAvatarInput
        type="file"
        id="avatar"
        name="avatar"
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
  onChange,
  errors,
}: {
  user: NonNullable<User>;
  onChange: (v: string) => void;
  errors: string[];
}) {
  const [value, setValue] = useState('');

  function updateValue(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onChange(e.target.value);
  }

  return (
    <InputField
      type="text"
      id="username"
      name="username"
      label="New username"
      placeholder={user.username}
      value={value}
      onChange={(e) => updateValue(e)}
      autoComplete="off"
      helpers={errors}
      isError={errors.length > 0}
    />
  );
}

function UpdateDescription({
  user,
  onChange,
  errors,
}: {
  user: NonNullable<User>;
  onChange: (v: string) => void;
  errors: string[];
}) {
  const [value, setValue] = useState('');

  function updateValue(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    onChange(e.target.value);
  }

  return (
    <div>
      <TextareaField
        id="user-desc"
        name="user-desc"
        label="New description"
        placeholder={user.desc}
        rows={4}
        wrap="soft"
        value={value ?? ''}
        onChange={(e) => updateValue(e)}
        helpers={errors}
        isError={errors.length > 0}
      />
      <p>{value.length} / 200</p>
    </div>
  );
}

function UpdateEmail({
  user,
  onChange,
  errors,
}: {
  user: NonNullable<User>;
  onChange: (v: string) => void;
  errors: string[];
}) {
  const [value, setValue] = useState('');

  function updateValue(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onChange(e.target.value);
  }

  return (
    <InputField
      type="email"
      id="email"
      name="email"
      label="New email"
      placeholder={user.email}
      value={value ?? ''}
      onChange={(e) => updateValue(e)}
      autoComplete="off"
      helpers={errors}
      isError={errors.length > 0}
    />
  );
}

function UpdatePassword({
  onChange,
  onChangeCurrentPassword,
  errors,
}: {
  onChange: (v: string) => void;
  onChangeCurrentPassword: (v: string) => void;
  errors: string[];
}) {
  const [currentValue, setCurrentValue] = useState('');
  const [value, setValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [confirmError, setConfirmError] = useState('');

  function onChangeCurrentValue(e: React.ChangeEvent<HTMLInputElement>) {
    setCurrentValue(e.target.value);
    onChangeCurrentPassword(e.target.value);
  }

  function onChange1(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue: string = e.target.value;
    setValue(newValue);
    if (confirmValue !== '' && newValue !== confirmValue) {
      setConfirmError("Passwords don't match.");
    } else {
      setConfirmError('');
    }
    onChange(newValue !== '' && newValue === confirmValue ? newValue : '');
  }

  function onChange2(e: React.ChangeEvent<HTMLInputElement>) {
    const newConfirm: string = e.target.value;
    setConfirmValue(newConfirm);
    if (newConfirm !== '' && value !== newConfirm) {
      setConfirmError("Passwords don't match.");
      onChange('');
    } else {
      setConfirmError('');
      onChange(value !== '' && value === newConfirm ? value : '');
    }
  }

  return (
    <>
      <InputField
        type="password"
        id="current-password"
        name="current-password"
        label="Current password"
        placeholder="••••••••"
        value={currentValue}
        onChange={(e) => onChangeCurrentValue(e)}
        autoComplete="current-password"
      />
      <InputField
        type="password"
        id="new-password"
        name="new-password"
        label="New password"
        placeholder="••••••••"
        value={value ?? ''}
        onChange={(e) => onChange1(e)}
        autoComplete="new-password"
        helpers={errors}
        isError={errors.length > 0}
      />
      <InputField
        type="password"
        id="new-password-conf"
        name="new-password-conf"
        label="Confirm new password"
        placeholder="••••••••"
        value={confirmValue ?? ''}
        onChange={(e) => onChange2(e)}
        autoComplete="new-password"
        isError={!!confirmError.length}
        helpers={[confirmError]}
      />
    </>
  );
}

export default EditProfile;
