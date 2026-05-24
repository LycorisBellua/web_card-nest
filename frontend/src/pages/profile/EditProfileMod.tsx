import { useState, useEffect, useRef, useMemo } from 'react';
import type { User, UserLimited } from 'context/Types';
import { useUser } from 'context/useUser';
import {
  sanitizeUsername,
  sanitizeDescription,
} from 'functions/UserSanitation';
import {
  validateUsername,
  validateDescription,
  validateAvatar,
} from 'functions/UserValidation';
import { RefreshTokenRequest } from 'functions/Requests';
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
  desc: string[];
  server: string[];
};

const emptyFieldErrors = (): FieldErrors => ({
  avatar: [],
  username: [],
  desc: [],
  server: [],
});

interface Props {
  otherUser: UserLimited;
  setOtherUser: (e: UserLimited) => void;
}

function EditProfileMod({ otherUser, setOtherUser }: Props) {
  const { user, setUser } = useUser();
  const [displaySpinner, setDisplaySpinner] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>(emptyFieldErrors());
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [avatar, setAvatar] = useState<File | '' | undefined>(undefined);
  const [username, setUsername] = useState('');
  const [desc, setDesc] = useState('');

  if (!user || !otherUser || !CanDisciplineThisUser(user, otherUser))
    return <></>;

  const hasPendingChanges =
    avatar !== undefined || username !== '' || desc !== '';

  async function handleSave() {
    if (!hasPendingChanges || isSaving) return;

    setDisplaySpinner(true);
    setFieldErrors(emptyFieldErrors());
    setSuccessMessage('');
    setIsSaving(true);

    const sanitizedUsername = username !== '' ? sanitizeUsername(username) : '';
    const sanitizedDescription = desc !== '' ? sanitizeDescription(desc) : '';

    const nextErrors: FieldErrors = emptyFieldErrors();
    if (avatar instanceof File)
      nextErrors.avatar.push(...(await validateAvatar(avatar)));
    if (sanitizedUsername !== '')
      nextErrors.username.push(...validateUsername(sanitizedUsername));
    if (sanitizedDescription !== '')
      nextErrors.desc.push(...validateDescription(sanitizedDescription));

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

    try {
      let token = user!.accessToken;

      if (Object.keys(body).length > 0) {
        body.targetId = otherUser.id;
        let res = await fetch('/api/admin/modify', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (res.status === 401) {
          token = await RefreshTokenRequest(token);
          if (token.length) {
            res = await fetch('/api/admin/modify', {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            });
          }
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
      }
      if (token.length) {
        setUser((prev) => ({ ...prev, accessToken: token }) as User);
        setOtherUser({ ...otherUser, ...body } as UserLimited);
      }
    } catch {
      setIsSaving(false);
      setDisplaySpinner(false);
      return;
    }

    setAvatar(undefined);
    setUsername('');
    setDesc('');
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
        otherUser={otherUser}
        pendingAvatar={avatar}
        onChange={setAvatar}
        errors={fieldErrors.avatar}
      />
      <div className="main">
        <UpdateUsername
          key={`username-${resetKey}`}
          otherUser={otherUser}
          onChange={setUsername}
          errors={fieldErrors.username}
        />
        <UpdateDescription
          key={`desc-${resetKey}`}
          otherUser={otherUser}
          onChange={setDesc}
          errors={fieldErrors.desc}
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
  otherUser,
  pendingAvatar,
  onChange,
  errors,
}: {
  otherUser: UserLimited;
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
        : otherUser.avatar;

  return (
    <div>
      <AvatarBig
        src={avatarSrc ?? ''}
        rank={otherUser.rank}
        isOnline={otherUser.isOnline}
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
  otherUser,
  onChange,
  errors,
}: {
  otherUser: UserLimited;
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
      placeholder={otherUser.username}
      value={value}
      onChange={(e) => updateValue(e)}
      autoComplete="off"
      helpers={errors}
      isError={errors.length > 0}
    />
  );
}

function UpdateDescription({
  otherUser,
  onChange,
  errors,
}: {
  otherUser: UserLimited;
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
        placeholder={otherUser.desc}
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
