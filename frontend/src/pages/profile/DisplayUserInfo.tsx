import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User, UserLimitedOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import { GetDate } from 'functions/Time';
import { ResendVerificationEmailRequest } from 'functions/Requests';
import { AvatarBig } from 'components/btn/Avatar';
import { BtnDefault } from 'components/btn/Btn';
import { UsernameBig } from 'components/btn/Username';
import { RankBadgeBig } from 'components/btn/RankBadge';
import styled from 'styled-components';

const PublicWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 12px;
  border-radius: 8px;
`;

const PublicRightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export function DisplayPublicUserInfo({ user }: { user: UserLimitedOrGuest }) {
  if (!user) {
    return (
      <PublicWrapper>
        <AvatarBig src="" rank="guest" isOnline={false} />
        <PublicRightCol>
          <UsernameBig rank="guest" value="Guest" />
          <RankBadgeBig rank="guest" />
        </PublicRightCol>
      </PublicWrapper>
    );
  }
  return (
    <PublicWrapper>
      <AvatarBig src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <PublicRightCol>
        <UsernameBig rank={user.rank} value={user.username} />
        <RankBadgeBig rank={user.rank} />
        <p>Registered: {GetDate(user.registered)}</p>
        <p>Description: {user.description}</p>
      </PublicRightCol>
    </PublicWrapper>
  );
}

export function DisplayPrivateUserInfo({ user }: { user: NonNullable<User> }) {
  return (
    <div>
      <h2>Private Info</h2>
      <p>Email: {user.email ?? '[None / Pending verification]'}</p>
      {user.unverifiedEmail && <VerifyEmail user={user} />}
    </div>
  );
}

function VerifyEmail({ user }: { user: NonNullable<User> }) {
  const { setUser } = useUser();
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  async function handleVerifyEmail() {
    try {
      const newAccessToken = await ResendVerificationEmailRequest(
        user.accessToken,
      );
      if (!newAccessToken.length) {
        setErrors(['Error occurred']);
        return;
      }
      setUser((prev) => ({ ...prev, accessToken: newAccessToken }) as User);
      setMessage("You'll receive a verification link shortly...");
    } catch {
      setErrors(['Error occurred']);
    }
  }

  return (
    <div>
      <div>
        <p>Unverified email: {user.unverifiedEmail}</p>
        <BtnDefault onClick={() => void handleVerifyEmail()}>
          Resend Verification Email
        </BtnDefault>
      </div>
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
      {message && <p>{message}</p>}
      <Link to="/data-extraction">
        <BtnDefault>Go to Personal Data Extraction Page</BtnDefault>
      </Link>
    </div>
  );
}
