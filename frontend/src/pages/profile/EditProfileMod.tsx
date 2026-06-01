import { useState, useEffect, useRef, useMemo } from 'react';
import type { User } from 'context/Types';
import {
  sanitizeUsername,
  sanitizeDescription,
} from 'functions/UserSanitation';
import {
  validateUsername,
  validateDescription,
  validateAvatar,
} from 'functions/UserValidation';
import { CanDisciplineThisUser } from 'functions/Ranks';
import { BtnDefault, BtnDisabled } from 'components/btn/Btn';
import { AvatarBig } from 'components/btn/Avatar';
import InputField from 'components/misc/InputField';
import TextareaField from 'components/misc/TextareaField';
import Spinner from 'components/misc/Spinner';
import styled from 'styled-components';

type FieldErrors = {
  avatar: string[];
  username: string[];
  description: string[];
  server: string[];
};

const emptyFieldErrors = (): FieldErrors => ({
  avatar: [],
  username: [],
  description: [],
  server: [],
});

function EditProfileMod({ user }: { user: NonNullable<User> }) {
  const [displaySpinner, setDisplaySpinner] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>(emptyFieldErrors());
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [avatar, setAvatar] = useState<File | '' | undefined>(undefined);
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');

  if (!CanDisciplineThisUser(user)) return <></>;

  const hasPendingChanges =
    avatar !== undefined || username !== '' || description !== '';

  async function handleSave() {
    if (!hasPendingChanges || isSaving) return;

    setDisplaySpinner(true);
    setFieldErrors(emptyFieldErrors());
    setSuccessMessage('');
    setIsSaving(true);

    const sanitizedUsername = username !== '' ? sanitizeUsername(username) : '';
    const sanitizedDescription =
      description !== '' ? sanitizeDescription(description) : '';

    const nextErrors: FieldErrors = emptyFieldErrors();
    if (avatar instanceof File)
      nextErrors.avatar.push(...(await validateAvatar(avatar)));
    if (sanitizedUsername !== '')
      nextErrors.username.push(...validateUsername(sanitizedUsername));
    if (sanitizedDescription !== '')
      nextErrors.description.push(...validateDescription(sanitizedDescription));

    const hasFieldErrors = Object.values(nextErrors).some((e) => e.length > 0);
    if (hasFieldErrors) {
      setFieldErrors(nextErrors);
      setIsSaving(false);
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
    if (sanitizedUsername !== '') body.username = sanitizedUsername;
    if (sanitizedDescription !== '') body.description = sanitizedDescription;

    if (Object.keys(body).length > 0) {
      requests.push(
        fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
    }

    const responses = await Promise.all(requests);
    const failed = responses.filter((r) => !r.ok);
    if (failed.length > 0) {
      setFieldErrors((prev) => ({
        ...prev,
        server: failed.map((r) => `Error ${r.status}: ${r.statusText}`),
      }));
      setIsSaving(false);
      setDisplaySpinner(false);
      return;
    }

    if (Object.keys(body).length > 0) {
      //const updated = (await responses[0].json()) as Partial<NonNullable<User>>;
      //setUser((old) => (old ? { ...old, ...updated } : null));
      //TODO: This other user is modified. Is the change immediate on the front?
    }

    setAvatar(undefined);
    setUsername('');
    setDescription('');
    setResetKey((k) => k + 1);
    setSuccessMessage('Changes saved successfully.');
    setIsSaving(false);
    setDisplaySpinner(false);
  }

  const SaveButton = hasPendingChanges && !isSaving ? BtnDefault : BtnDisabled;

  return (
    <div>
      <h2>Edit Profile As A Mod</h2>
      <UpdateAvatar
        key={`avatar-${resetKey}`}
        user={user}
        pendingAvatar={avatar}
        onChange={setAvatar}
        errors={fieldErrors.avatar}
      />
      <div className="main">
        <UpdateUsername
          key={`username-${resetKey}`}
          user={user}
          onChange={setUsername}
          errors={fieldErrors.username}
        />
        <UpdateDescription
          key={`description-${resetKey}`}
          user={user}
          onChange={setDescription}
          errors={fieldErrors.description}
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
        id="user-description"
        name="user-description"
        label="New description"
        placeholder={user.description}
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

export default EditProfileMod;
