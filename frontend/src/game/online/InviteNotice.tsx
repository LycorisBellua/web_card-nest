import { useNavigate } from 'react-router-dom';
import { useGame } from 'game/online/useGame';
import { BtnDefault } from 'components/btn/Btn';

/**
 * App-wide invite notification. Renders a small fixed banner whenever an invite
 * arrives, from anywhere in the app — it is driven by the GameProvider's
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
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: 8,
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      }}
    >
      <span>You&apos;ve been invited to a game.</span>
      <BtnDefault onClick={accept}>Accept</BtnDefault>
      <BtnDefault onClick={rejectInvite}>Decline</BtnDefault>
    </div>
  );
}
