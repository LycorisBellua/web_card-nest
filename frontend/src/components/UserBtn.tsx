import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { UserLimitedOrGuest } from 'context/Types';
import { Avatar } from 'components/Avatar';
import Username from 'components/Username';

const Wrapper = styled.div`
  a {
    text-decoration: none;
  }
`;

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

function UserBtn({
  user,
  path,
  onClick,
}: {
  user: UserLimitedOrGuest;
  path: string;
  onClick?: () => void;
}) {
  if (!user)
    return (
      <Wrapper>
        <Link to={path}>
          <Btn onClick={onClick}>
            <Username rank="guest" value="Log In" />
          </Btn>
        </Link>
      </Wrapper>
    );
  return (
    <Wrapper>
      <Link to={path}>
        <Btn onClick={onClick}>
          <Avatar src={user.avatar} rank={user.rank} isOnline={user.isOnline} />
          <Username rank={user.rank} value={user.username} />
        </Btn>
      </Link>
    </Wrapper>
  );
}

export default UserBtn;
