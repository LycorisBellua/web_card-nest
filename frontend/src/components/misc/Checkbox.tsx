import styled from 'styled-components';

/*
  const [done, setDone] = useState<boolean>(true);

  <Checkbox
    label="Finish the game setup"
    checked={done}
    onChange={setDone}
  />
*/

const Item = styled.div`
  margin: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const Box = styled.div<{ $checked: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 7px;
  flex-shrink: 0;
  background: ${({ $checked }) =>
    $checked ? 'rgba(212, 160, 96, 0.14)' : '#221a14'};
  border: 1px solid
    ${({ $checked }) => ($checked ? 'rgba(212, 160, 96, 0.4)' : '#50382a')};
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    border-color 0.15s;
`;

const CheckMark = styled.span<{ $checked: boolean }>`
  color: #d9a85a;
  font-size: 13px;
  opacity: ${({ $checked }) => ($checked ? 1 : 0)};
  transition: opacity 0.15s;
`;

const Label = styled.span<{ $checked: boolean }>`
  font-size: 0.84rem;
  font-weight: 700;
  color: ${({ $checked }) => ($checked ? '#7a5c42' : '#e0c498')};
`;

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  const toggle = () => onChange(!checked);

  return (
    <Item
      onClick={toggle}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggle();
        }
      }}
    >
      <Box $checked={checked}>
        <CheckMark $checked={checked}>✓</CheckMark>
      </Box>
      <Label $checked={checked}>{label}</Label>
    </Item>
  );
}

export default Checkbox;
