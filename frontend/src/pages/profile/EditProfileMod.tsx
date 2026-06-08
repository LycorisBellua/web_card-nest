import { useState, useEffect, useRef, useMemo } from 'react';
import type { User, OtherUser } from 'context/Types';
import { useUser } from 'context/useUser';
import { useSocket } from 'context/useSocket';
import {
  sanitizeUsername,
  sanitizeDescription,
} from 'functions/UserSanitation';
import {
  validateUsername,
  validateDescription,
  validateAvatar,
  addAvatarPrefix,
} from 'functions/UserValidation';
import {
  refreshTokenRequest,
  fetchSelfBlockedListRequest,
  fetchSelfFriendListRequest,
  fetchSelfSentListRequest,
  fetchSelfReceivedListRequest,
} from 'functions/Requests';
import { canDisciplineThisUser } from 'functions/Ranks';
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
  otherUser: OtherUser;
  setOtherUser: (e: OtherUser) => void;
}

function EditProfileMod({ otherUser, setOtherUser }: Props) {
  const {
    user,
    setUser,
    blocked,
    setBlocked,
    friends,
    setFriends,
    sentFriends,
    setSentFriends,
    receivedFriends,
    setReceivedFriends,
  } = useUser();
  const [displaySpinner, setDisplaySpinner] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>(emptyFieldErrors());
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);

  const [avatar, setAvatar] = useState<File | '' | undefined>(undefined);
  const [username, setUsername] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  if (
    !user ||
    !otherUser ||
    !canDisciplineThisUser(user?.rank ?? '', otherUser?.rank ?? '')
  )
    return <></>;

  const hasPendingChanges =
    avatar !== undefined || username !== '' || desc !== '';

  async function updateRelationships(accessToken: string): Promise<string> {
    const inBlocked = blocked.some((u) => u.id === otherUser.id);
    const inFriends = friends.some((u) => u.id === otherUser.id);
    const inSentFriends = sentFriends.some((u) => u.id === otherUser.id);
    const inReceivedFriends = receivedFriends.some(
      (u) => u.id === otherUser.id,
    );
    if (inBlocked) {
      const data = await fetchSelfBlockedListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setBlocked(data.users);
    } else if (inFriends) {
      const data = await fetchSelfFriendListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setFriends(data.users);
    } else if (inSentFriends) {
      const data = await fetchSelfSentListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setSentFriends(data.users);
    } else if (inReceivedFriends) {
      const data = await fetchSelfReceivedListRequest(accessToken);
      if (!data.accessToken.length) return '';
      accessToken = data.accessToken;
      setReceivedFriends(data.users);
    }
    return accessToken;
  }

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

    if (sanitizedUsername !== '' && sanitizedUsername != otherUser.username) {
      body.username = sanitizedUsername;
    }
    if (sanitizedDescription !== '' && sanitizedDescription != otherUser.desc) {
      body.desc = sanitizedDescription;
    }

    try {
      const tmpOtherUser = { ...otherUser };
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
          token = await refreshTokenRequest(token);
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
          throw new Error();
        }

        const updated = (await res.json()) as Partial<NonNullable<OtherUser>>;
        if (updated.username) tmpOtherUser.username = updated.username;
        if (updated.desc) tmpOtherUser.desc = updated.desc;
        tmpOtherUser.avatar = addAvatarPrefix(updated.avatar ?? '');
      }

      if (token.length) {
        setOtherUser(tmpOtherUser);
        token = await updateRelationships(token);
        if (token.length) {
          setUser((prev) => ({ ...prev, accessToken: token }) as User);
        }
        if (sanitizedUsername) {
          window.history.replaceState(null, '', `/user/${sanitizedUsername}`);
        }
      }
    } catch {
      return;
    } finally {
      setIsSaving(false);
      setDisplaySpinner(false);
    }

    setAvatar(undefined);
    setUsername('');
    setDesc('');
    setResetKey((k) => k + 1);
    setSuccessMessage('Changes saved successfully.');
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
  otherUser: OtherUser;
  pendingAvatar: File | '' | undefined;
  onChange: (f: File | '') => void;
  errors: string[];
}) {
  const { onlineUsers } = useSocket();
  const isOnline = !!otherUser && onlineUsers.has(otherUser.id);
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
        isOnline={isOnline}
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
  otherUser: OtherUser;
  onChange: (v: string) => void;
  errors: string[];
}) {
  const [value, setValue] = useState<string>('');

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
  otherUser: OtherUser;
  onChange: (v: string) => void;
  errors: string[];
}) {
  const [value, setValue] = useState<string>('');

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
