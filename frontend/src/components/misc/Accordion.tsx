import { useState } from 'react';
import styled from 'styled-components';

/*
  <Accordion title="Accordion Title?" content="Accordion content..." />
*/

const Item = styled.div`
  border: 1px solid #3a2a1e;
  border-radius: 12px;
  overflow: hidden;
`;

const Trigger = styled.button<{ $open: boolean }>`
  width: 100%;
  padding: 13px 16px;
  text-align: left;
  cursor: pointer;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${({ $open }) => ($open ? '#d9a85a' : '#aa8a68')};
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover {
    background: rgba(212, 160, 96, 0.05);
    color: #e0c498;
  }
`;

const Icon = styled.span<{ $open: boolean }>`
  transition: transform 0.22s;
  font-size: 0.7rem;
  flex-shrink: 0;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0)')};
`;

const Body = styled.div<{ $open: boolean }>`
  max-height: ${({ $open }) => ($open ? '200px' : '0')};
  overflow: hidden;
  transition: max-height 0.28s ease;
`;

const Content = styled.div`
  padding: 0 16px 14px;
  font-size: 0.78rem;
  color: #7a5c42;
  line-height: 1.65;
`;

function Accordion({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <Item>
      <Trigger onClick={toggle} $open={open}>
        {title}
        <Icon $open={open}>▾</Icon>
      </Trigger>
      <Body $open={open}>
        <Content>{content}</Content>
      </Body>
    </Item>
  );
}

export default Accordion;
