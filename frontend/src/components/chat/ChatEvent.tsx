import type { UserLimited } from 'context/Types';
import styled from 'styled-components';

const Card = styled.div`
  margin: 8px 0;
  background: rgba(176, 144, 216, 0.07);
  border: 1px solid rgba(176, 144, 216, 0.18);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
  container-type: inline-size;
`;

const Icon = styled.span`
  font-size: 1rem;
`;

const Text = styled.div`
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  color: #d0a888;
  flex: 1;
  line-height: 1.45;
  min-width: 0;

  strong {
    color: #c8a0e8;
  }

  @container (max-width: 300px) {
    width: 100%;
  }
`;

const Btns = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;

  @container (max-width: 300px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const WatchBtn = styled.button`
  background: transparent;
  color: #b090d8;
  border: 1px solid rgba(176, 144, 216, 0.35);
  border-radius: 8px;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  white-space: pre-wrap;
  flex-shrink: 0;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover {
    background: rgba(176, 144, 216, 0.1);
    border-color: rgba(176, 144, 216, 0.55);
    color: #c8a8f0;
  }
`;

const JoinBtn = styled.button`
  background: linear-gradient(135deg, #9060c0, #b090d8);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  white-space: pre-wrap;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(144, 96, 192, 0.35);
  transition:
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(144, 96, 192, 0.45);
  }
`;

function ChatEvent({
  users,
  table_number,
  table_size,
}: {
  users: UserLimited[];
  table_number: number;
  table_size: number;
}) {
  if (!users.length || table_size < users.length) return <></>;
  const players_needed = users.length < table_size;
  return (
    <Card>
      <Icon>🃏</Icon>
      <Text>
        {players_needed ? (
          <>
            <strong>Table {table_number}</strong> asks for a player:{' '}
            {users.length}/{table_size}
          </>
        ) : (
          <>
            <strong>Table {table_number}</strong> is full: {users.length}/
            {table_size}
          </>
        )}
      </Text>
      <Btns>
        <WatchBtn>Watch</WatchBtn>
        {players_needed && <JoinBtn>Join</JoinBtn>}
      </Btns>
    </Card>
  );
}

export default ChatEvent;
