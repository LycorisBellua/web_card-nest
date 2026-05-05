import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from 'components/Button';
import UserMenu from 'pages/profile/UserMenu';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: 3rem;
  flex-shrink: 0;
  background: #100c09;
  border-bottom: 1px solid #3a2a1e;
  gap: 8px;

  @media (max-height: 620px) {
    height: 2.5rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  cursor: default;
`;

const LogoMark = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(145deg, #d9a85a, #8b4820);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  box-shadow:
    0 0 14px rgba(212, 160, 112, 0.3),
    inset 0 1px 0 rgba(255, 220, 160, 0.15);
  flex-shrink: 0;
`;

const LogoText = styled.div`
  font-family: 'Quicksand', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0e2cc;
  white-space: pre-wrap;

  span {
    color: #f5c842;
  }
`;

const TopNav = styled.nav`
  display: flex;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    display: none;
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const SubNav = styled.nav`
  display: none;
  height: 2.375rem;
  flex-shrink: 0;
  background: #100c09;
  border-bottom: 1px solid #3a2a1e;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;

  button {
    flex: 1;
    text-align: center;
    padding: 5px 4px;
    font-size: 0.7rem;
  }

  @media (max-width: 600px) {
    display: flex;
  }
`;

function Nav({ onDMsClick }: { onDMsClick: () => void }) {
  return (
    <>
      <TopBar>
        <Logo>
          <LogoMark>🃏</LogoMark>
          <LogoText>
            Card<span>Nest</span>
          </LogoText>
        </Logo>
        <TopNav>
          <Link to="/">
            <Button>💬 Lobby</Button>
          </Link>
          <Link to="/play">
            <Button>🃏 Play</Button>
          </Link>
          <Link to="/users">
            <Button>👤 Users</Button>
          </Link>
        </TopNav>
        <TopBarRight>
          <UserMenu />
        </TopBarRight>
      </TopBar>
      <SubNav>
        <div>
          <Button onClick={onDMsClick}>DMs</Button>
        </div>
        <Link to="/">
          <Button>💬 Lobby</Button>
        </Link>
        <Link to="/play">
          <Button>🃏 Play</Button>
        </Link>
        <Link to="/users">
          <Button>👤 Users</Button>
        </Link>
      </SubNav>
    </>
  );
}

export default Nav;
