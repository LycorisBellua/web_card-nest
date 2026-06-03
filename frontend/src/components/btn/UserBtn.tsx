import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { OtherUserOrGuest } from 'context/Types';
import UserBtnBase from 'components/btn/UserBtnBase';

const Wrapper = styled.div`
  button {
    width: 100%;
  }
`;

function UserBtn({
  user,
  path,
  onClick,
}: {
  user: OtherUserOrGuest;
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
