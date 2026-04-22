import styled from 'styled-components';

const Head = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid #38281a;
  display: flex;
  flex-direction: column;
  align-items: left;
  flex-shrink: 0;

  @media (max-height: 620px) {
    padding: 7px 14px;
  }
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
  title,
  nbr_online,
}: {
  title: string;
  nbr_online: number;
}) {
  return (
    <Head>
      <Title># {title}</Title>
      <Sub>
        <LiveDot></LiveDot>
        {nbr_online} online
      </Sub>
    </Head>
  );
}

export default ChatHead;
