import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
`;

const Trigger = styled.button<{ $open: boolean }>`
  width: 100%;
  padding: 10px 14px;
  cursor: pointer;
  border-radius: 10px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  color: #e0c498;
  background: #221a14;
  border: 1px solid #50382a;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
  transition:
    border-color 0.15s,
    background 0.15s;

  ${({ $open }) =>
    $open &&
    `
    border-color: rgba(212, 160, 96, 0.4);
    background: rgba(212, 160, 96, 0.06);
  `}
`;

const Arrow = styled.span<{ $open: boolean }>`
  transition: transform 0.22s;
  font-size: 0.7rem;
  color: #7a5c42;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const Menu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #1e1410;
  border: 1px solid #50382a;
  border-radius: 12px;
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? '220px' : '0')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'all' : 'none')};
  transition:
    max-height 0.25s ease,
    opacity 0.18s;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
`;

const Option = styled.div<{ $active: boolean }>`
  padding: 10px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
  color: ${({ $active }) => ($active ? '#d9a85a' : '#aa8a68')};
  border-bottom: 1px solid #3a2a1e;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(212, 160, 96, 0.08);
    color: #e0c498;
  }
`;

function Dropdown({
  initialValue,
  options,
}: {
  initialValue: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(initialValue);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const select = (val: string) => {
    setValue(val);
    setOpen(false);
  };

  return (
    <Wrapper ref={ref}>
      <Trigger onClick={() => setOpen((prev) => !prev)} $open={open}>
        <span>{value}</span>
        <Arrow $open={open}>▾</Arrow>
      </Trigger>
      <Menu $open={open}>
        {options.map((opt) => (
          <Option key={opt} onClick={() => select(opt)} $active={value === opt}>
            {opt}
          </Option>
        ))}
      </Menu>
    </Wrapper>
  );
}

export default Dropdown;
