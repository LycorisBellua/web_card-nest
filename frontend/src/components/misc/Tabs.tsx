import { useState } from 'react';
import styled from 'styled-components';

/*
  <Tabs
    items={[
      {
        label: 'Overview',
        content:
          'Overview: your stats, recent games, and earned badges all in one place.',
      },
      {
        label: 'History',
        content:
          'History: a full log of every game played, opponents, results, and XP earned.',
      },
      {
        label: 'Settings',
        content:
          'Settings: notification preferences, display name, privacy, and account actions.',
      },
    ]}
  />
*/

const TabsNav = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 14px;
  background: #221a14;
  border: 1px solid #3a2a1e;
  border-radius: 11px;
  padding: 4px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#d9a85a' : '#7a5c42')};
  background: ${({ $active }) =>
    $active ? 'rgba(212, 160, 96, 0.14)' : 'transparent'};
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    color: #aa8a68;
    background: rgba(212, 160, 96, 0.06);
  }
`;

const TabPanel = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => ($active ? 'block' : 'none')};
  font-size: 0.8rem;
  color: #7a5c42;
  line-height: 1.65;
`;

function Tabs({ items }: { items: { label: string; content: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <TabsNav>
        {items.map((tab, index) => (
          <TabButton
            key={tab.label}
            $active={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsNav>
      {items.map((tab, index) => (
        <TabPanel key={tab.label} $active={index === activeIndex}>
          {tab.content}
        </TabPanel>
      ))}
    </div>
  );
}

export default Tabs;
