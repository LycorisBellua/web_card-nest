import styled from 'styled-components';

const Wrap = styled.div`
  padding: 10px 14px 12px;
  border-top: 1px solid #38281a;
  flex-shrink: 0;

  @media (max-height: 620px) {
    padding: 7px 12px 8px;
  }
`;

const Box = styled.div`
  background: #0e0a08;
  border: 1px solid #3a2a1e;
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: rgba(212, 160, 112, 0.35);
  }
`;

const Field = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: #c09070;
  min-width: 0;

  &::placeholder {
    color: #533d2c;
  }
`;

const Send = styled.button`
  background: linear-gradient(135deg, #d9a85a, #8b4820);
  border: none;
  border-radius: 0.5rem;
  width: 1.875rem;
  height: 1.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(180, 100, 50, 0.4);
  transition:
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 5px 16px rgba(180, 100, 50, 0.5);
  }
`;

function ChatInput() {
  return (
    <Wrap>
      <Box>
        <Field name="chat_input" placeholder="Say something..." />
        <Send>➤</Send>
      </Box>
    </Wrap>
  );
}

export default ChatInput;
