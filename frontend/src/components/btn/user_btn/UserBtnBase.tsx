import type { UserLimitedOrGuest } from 'context/Types';
import { Avatar } from 'components/btn/user_btn/Avatar';
import { Username } from 'components/btn/user_btn/Username';
import { RankBadge } from 'components/btn/user_btn/RankBadge';
import BtnGhost from 'components/btn/BtnGhost';
import styled from 'styled-components';

const Btn = styled(BtnGhost)`
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

function UserBtnBase({
  user,
  onClick,
}: {
  user: UserLimitedOrGuest;
  onClick?: () => void;
}) {
  if (!user) {
    return (
      <Btn onClick={onClick}>
        <Username rank="guest" value="Log In" />
      </Btn>
    );
  }
  return (
    <Btn onClick={onClick}>
      <Avatar src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <Username rank={user.rank} value={user.username} />
      <RankBadge rank={user.rank}>{user.rank}</RankBadge>
    </Btn>
  );
}

export default UserBtnBase;
