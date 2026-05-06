import styled from 'styled-components';

/*
  const [notifications, setNotifications] = useState(true);

  <Toggle
    label="Lobby notifications"
    description="Ping when friends join"
    checked={notifications}
    onChange={setNotifications}
  />
*/

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Info = styled.div`
  span {
    display: block;
    font-size: 0.84rem;
    font-weight: 700;
    color: #e0c498;
  }

  small {
    font-size: 0.68rem;
    color: #7a5c42;
  }
`;

const Switch = styled.div<{ $on: boolean }>`
  width: 48px;
  height: 26px;
  border-radius: 999px;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  background: ${({ $on }) =>
    $on ? 'rgba(212, 160, 96, 0.18)' : 'rgba(212, 160, 96, 0.06)'};
  border: 1px solid
    ${({ $on }) => ($on ? 'rgba(212, 160, 96, 0.4)' : '#50382a')};
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3);
  transition:
    background 0.28s,
    border-color 0.28s;

  &::after {
    content: '';
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ $on }) => ($on ? '#d9a85a' : '#533d2c')};
    box-shadow: ${({ $on }) =>
      $on
        ? '0 2px 8px rgba(212, 160, 96, 0.5)'
        : '0 2px 5px rgba(0, 0, 0, 0.4)'};
    position: absolute;
    top: 3px;
    left: 3px;
    transform: ${({ $on }) => ($on ? 'translateX(22px)' : 'translateX(0)')};
    transition:
      transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.28s;
  }
`;

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  const toggle = () => onChange(!checked);

  return (
    <Row>
      <Info>
        <span>{label}</span>
        {description && <small>{description}</small>}
      </Info>
      <Switch
        $on={checked}
        onClick={toggle}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle();
          }
        }}
      />
    </Row>
  );
}

export default Toggle;
