import { Link } from 'react-router-dom';
import { BtnDefault } from 'components/btn/Btn';
import styled from 'styled-components';

const Head = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid #38281a;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  gap: 12px;

  @media (max-height: 620px) {
    padding: 7px 14px;
  }
`;

const LeftPanel = styled(BtnDefault)`
  width: 36px;
  height: 36px;
  border: 1px solid #38281a;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.div`
  font-family: inherit;
  font-weight: 700;
  color: #d9a85a;
  font-size: 0.88rem;
`;

const Sub = styled.div`
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  color: #b08060;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LiveDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d9a85a;
  animation: pulse 2.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
      box-shadow: 0 0 0 0 rgba(212, 160, 112, 0.3);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 0 4px rgba(212, 160, 112, 0);
    }
  }
`;

function ChatHead({
  is_dm,
  title,
  nbr_online,
}: {
  is_dm: boolean;
  title: string;
  nbr_online: number;
}) {
  return (
    <Head>
      {is_dm && (
        <Link to={`/user/${title}`}>
          <LeftPanel>👤</LeftPanel>
        </Link>
      )}
      <TextGroup>
        <Title># {title}</Title>
        <Sub>
          <LiveDot />
          {nbr_online} online
        </Sub>
      </TextGroup>
    </Head>
  );
}

export default ChatHead;
