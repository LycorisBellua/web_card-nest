import styled from 'styled-components';
import type { UserLimited } from 'hooks/UserTypes';

const Btn = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(212, 160, 112, 0.09);
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
`;

const StatusDotOnline = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.44rem;
  height: 0.44rem;
  border-radius: 50%;
  border: 2px solid #0e0a08;
  background: #6aaa5a;
`;

const StatusDotOffline = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.44rem;
  height: 0.44rem;
  border-radius: 50%;
  border: 2px solid #0e0a08;
  background: #8f8f8f;
`;

const Username = styled.div`
  text-align: left;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #e0c498;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function UserBtn({ username, avatar, isOnline }: UserLimited) {
  return (
    <Btn>
      {avatar && (
        <AvatarWrapper>
          <AvatarImg src={avatar} alt="avatar" />
          {isOnline ? <StatusDotOnline /> : <StatusDotOffline />}
        </AvatarWrapper>
      )}
      <Username>{username}</Username>
    </Btn>
  );
}

export default UserBtn;
