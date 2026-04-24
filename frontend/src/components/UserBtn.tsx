import styled from 'styled-components';
import type { UserLimitedOrGuest } from 'context/Types';
import { Avatar } from 'components/Avatar';
import Username from 'components/Username';

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

function UserBtn({ user }: { user: UserLimitedOrGuest }) {
  if (!user)
    return (
      <Btn>
        <Username rank="guest" value="Log In" />
      </Btn>
    );
  return (
    <Btn>
      <Avatar src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
      <Username rank={user.rank} value={user.username} />
    </Btn>
  );
}

export default UserBtn;
