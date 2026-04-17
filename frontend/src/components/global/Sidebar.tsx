import { useUser } from 'hooks/UserContext';
import styled from 'styled-components';
import UserBtn from 'components/UserBtn';

const Bar = styled.div`
  width: 11rem;
  flex-shrink: 0;
  background: #0e0a08;
  border-right: 1px solid #38281a;
  padding: 1.125rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
  position: relative;
  overflow-y: auto;
  transition: transform 0.25s ease;

  @media (max-width: 600px) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 10;
    width: min(11rem, 80vw);
    transform: translateX(-110%);
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.55);
  }
`;

const Section = styled.div`
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  font-family: 'Epilogue', sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7a5c42;
  padding: 0 4px;
  margin-bottom: 10px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const EmptyMsg = styled.p`
  font-style: italic;
  font-size: 0.7rem;
`;

const Dots = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75%;
  background-image: radial-gradient(
    circle,
    rgba(212, 160, 112, 0.25) 1px,
    transparent 1px
  );
  background-size: 0.75rem 0.75rem;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.35) 28%,
    rgba(0, 0, 0, 0.75) 58%,
    black 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.35) 28%,
    rgba(0, 0, 0, 0.75) 58%,
    black 100%
  );
`;

const Suits1 = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px;
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: '♥ ♠';
    white-space: pre;
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 2.2rem;
    line-height: 1.6;
    color: rgba(212, 160, 112, 0.2);
    letter-spacing: 0.3em;
  }
`;

const Suits2 = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px;
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: '♦ ♣';
    white-space: pre;
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 2.2rem;
    line-height: 1.6;
    color: rgba(212, 160, 112, 0.2);
    letter-spacing: 0.3em;
  }
`;

function Sidebar() {
  const { user } = useUser();

  if (!user) return <></>;
  return (
    <Bar>
      <Section>
        <Header>Friends</Header>
        <UserList>
          {!user.friends?.length ? (
            <EmptyMsg>Empty friend list</EmptyMsg>
          ) : (
            user.friends.map((e) => (
              <UserBtn key={e.username}
                username={e.username}
                avatar={e.avatar}
                isOnline={e.isOnline}
              />
            ))
          )}
        </UserList>
      </Section>
      <Dots />
      <Suits1 />
      <Suits2 />
    </Bar>
  );
}

export default Sidebar;
