import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useGame } from 'game/online/useGame';
import { BtnDefault } from 'components/btn/Btn';

/**
 * App-wide invite notification. Renders a small fixed banner whenever an invite
 * arrives, from anywhere in the app - it is driven by the GameProvider's
 * `invite` state, which is why the provider is mounted high in the tree.
 *
 * Barebone by design: the styling is a placeholder (the "modal doesn't matter
 * yet"); what matters is that the notification is global and acts on the real
 * accept/reject actions.
 */
export default function InviteNotice() {
  const navigate = useNavigate();
  const { invite, acceptInvite, rejectInvite } = useGame();

  if (!invite) return null;

  const accept = () => {
    acceptInvite();
    void navigate('/play/online');
  };

  return (
    <Banner>
      <span>You&apos;ve been invited to a game.</span>
      <BtnDefault onClick={accept}>Accept</BtnDefault>
      <BtnDefault onClick={rejectInvite}>Decline</BtnDefault>
    </Banner>
  );
}

const Banner = styled.div`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
`;
