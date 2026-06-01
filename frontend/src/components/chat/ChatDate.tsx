import { GetDate } from 'functions/Time';
import styled from 'styled-components';

const DateDisplay = styled.div`
  text-align: center;
  font-family: inherit;
  font-size: 0.62rem;
  font-weight: 700;
  color: #aa8a68;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #3a2a1e;
  }
`;

function ChatDate({ date }: { date: Date }) {
  return <DateDisplay>{GetDate(date)}</DateDisplay>;
}

export default ChatDate;
