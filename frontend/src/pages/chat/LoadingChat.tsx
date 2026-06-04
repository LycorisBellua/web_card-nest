import { ScrollablePage } from 'components/general/Scrollable';

function LoadingChat({ isLobby }: { isLobby: boolean }) {
  return (
    <ScrollablePage>
      <p>{isLobby ? 'Loading lobby chat...' : 'Loading DM thread...'}</p>
    </ScrollablePage>
  );
}

export default LoadingChat;
