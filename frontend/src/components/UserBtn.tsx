import styled from 'styled-components';
import type { UserLimited } from 'hooks/Types';
import Avatar from 'components/Avatar';
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

function UserBtn({ username, avatar, rank, isOnline }: UserLimited) {
  return (
    <Btn>
      {avatar && <Avatar src={avatar} isOnline={isOnline} />}
      <Username rank={rank} value={username} />
    </Btn>
  );
}

export default UserBtn;
