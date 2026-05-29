import type { OtherUserOrGuest } from 'context/Types';
import { Avatar } from 'components/btn/Avatar';
import { Username } from 'components/btn/Username';
import { RankBadge } from 'components/btn/RankBadge';
import { BtnGhost } from 'components/btn/Btn';
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
  user: OtherUserOrGuest;
  onClick?: () => void;
}) {
  if (!user) {
    return (
      <Btn onClick={onClick}>
        <Avatar src="" rank="guest" isOnline={false} />
        <Username rank="guest" value="Guest" />
        <RankBadge rank="guest" />
      </Btn>
    );
  }
  return (
    <Btn onClick={onClick}>
      <Avatar src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <Username rank={user.rank} value={user.username} />
      <RankBadge rank={user.rank} />
    </Btn>
  );
}

export default UserBtnBase;
