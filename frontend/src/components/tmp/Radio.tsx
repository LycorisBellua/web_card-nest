import styled from 'styled-components';

type Option = {
  label: string;
  value: string;
};

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 13px;
  border-radius: 11px;
  cursor: pointer;
  background: ${({ $selected }) =>
    $selected ? 'rgba(212, 160, 96, 0.1)' : 'rgba(212, 160, 96, 0.04)'};
  border: 1px solid
    ${({ $selected }) => ($selected ? 'rgba(212, 160, 96, 0.3)' : '#3a2a1e')};
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: rgba(212, 160, 96, 0.08);
    border-color: #50382a;
  }
`;

const Dot = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #221a14;
  border: 1px solid
    ${({ $selected }) => ($selected ? 'rgba(212, 160, 96, 0.5)' : '#50382a')};
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #d9a85a;
    opacity: ${({ $selected }) => ($selected ? 1 : 0)};
    transition: opacity 0.2s;
  }
`;

const Label = styled.span`
  font-size: 0.84rem;
  font-weight: 700;
  color: #e0c498;
`;

function Radio({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <List role="radiogroup">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Item
            key={opt.value}
            $selected={selected}
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(opt.value);
              }
            }}
          >
            <Dot $selected={selected} />
            <Label>{opt.label}</Label>
          </Item>
        );
      })}
    </List>
  );
}

export default Radio;
