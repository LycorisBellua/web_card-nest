import { useState } from 'react';
import { sanitizeMessage } from 'functions/UserSanitation';
import BtnIcon from 'components/btn/BtnIcon';
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

function ChatInput({ onSend }: { onSend: (content: string) => void }) {
  const [value, setValue] = useState('');

  function handleSubmit() {
    const sanitized = sanitizeMessage(value);
    if (!sanitized) return;
    onSend(sanitized);
    setValue('');
  }

  return (
    <Wrap>
      <Box>
        <Field
          name="chat_input"
          placeholder="Say something..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <BtnIcon title="Send" onClick={handleSubmit}>
          ➤
        </BtnIcon>
      </Box>
    </Wrap>
  );
}

export default ChatInput;
