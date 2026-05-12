import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { UserLimitedOrGuest } from 'context/Types';
import UserBtnBase from 'components/btn/user_btn/UserBtnBase';

const Wrapper = styled.div`
  a {
    text-decoration: none;
  }

  button {
    width: 100%;
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
          <UserBtnBase user={null} onClick={onClick} />
        </Link>
      </Wrapper>
    );
  return (
    <Wrapper>
      <Link to={path}>
        <UserBtnBase user={user} onClick={onClick} />
      </Link>
    </Wrapper>
  );
}

export default UserBtn;
