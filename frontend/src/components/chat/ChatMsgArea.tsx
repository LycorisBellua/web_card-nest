import styled from 'styled-components';
import { ScrollableArea } from 'components/general/Scrollable';

const ChatMsgArea = styled(ScrollableArea)`
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  & > *:first-child {
    margin-top: auto;
  }

  @media (max-height: 620px) {
    padding: 8px 14px;
  }
`;

export default ChatMsgArea;
