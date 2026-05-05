import { useState } from 'react';
import { useUser } from 'context/useUser';
import { ScrollablePage } from 'components/general/Scrollable';
import UserBtn from 'components/user_btn/UserBtn';

import BtnAccent from 'components/tmp/btn/BtnAccent';
import BtnDanger from 'components/tmp/btn/BtnDanger';
import BtnDefault from 'components/tmp/btn/BtnDefault';
import BtnDisabled from 'components/tmp/btn/BtnDisabled';
import BtnGhost from 'components/tmp/btn/BtnGhost';
import BtnIcon from 'components/tmp/btn/BtnIcon';
import Modal from 'components/tmp/Modal';
import InputField from 'components/tmp/InputField';
import Spinner from 'components/tmp/Spinner';
import Slider from 'components/tmp/Slider';
import Dropdown from 'components/tmp/Dropdown';
import Accordion from 'components/tmp/Accordion';
import ContentCard from 'components/tmp/ContentCard';
import Breadcrumb from 'components/tmp/Breadcrumb';
import Tabs from 'components/tmp/Tabs';
import Radio from 'components/tmp/Radio';
import Checkbox from 'components/tmp/Checkbox';
import Toggle from 'components/tmp/Toggle';

function Users() {
  const { users } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('casual');
  const [done, setDone] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <ScrollablePage>
      <h1>Users</h1>
      {!users.length ? (
        <p>Empty user list</p>
      ) : (
        users.map((e) => (
          <UserBtn key={e.id} user={e} path={`/user/${e.username}`} />
        ))
      )}

      <div>
        <BtnAccent onClick={() => setIsModalOpen(true)}>Open Modal</BtnAccent>
        <BtnDanger>Danger</BtnDanger>
        <BtnDefault>Default</BtnDefault>
        <BtnDisabled>Disabled</BtnDisabled>
        <BtnGhost>Ghost</BtnGhost>
        <BtnIcon title="Settings">⚙</BtnIcon>
      </div>
      <div>
        <Modal
          isOpen={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={() => setIsModalOpen(false)}
          title="Leave table?"
          textMain="If you leave mid-game, the result will be recorded as a loss and your opponent will be awarded the win. This action cannot be undone."
          textCancel="Stay"
          textConfirm="Leave anyway"
        />
        <InputField
          textLabel="Email"
          textPlaceholder="john.doe@domain.com"
          textHelpers={['Please enter a valid email address']}
          isError={true}
        />
        <Spinner label="Connecting to table..." />
        <Spinner />
        <Slider textHeader="Volume" nbrMin={0} nbrMax={100} nbrStep={5} />
        <Dropdown
          initialValue="Choose a table theme..."
          options={[
            '🌧 Rainy Night',
            '☕ Corner Booth',
            '🕯 Candlelight',
            '🎶 Late Night Lo-fi',
            '🌙 After Hours',
          ]}
        />
        <Accordion title="Accordion Title?" content="Accordion content..." />
        <ContentCard
          title="Black Crown basics"
          content="A quick guide to how Black Crown works: hands, rules, and how to play with friends."
        />
        <Breadcrumb
          items={[
            { title: 'Card Nest', path: '/' },
            { title: 'Users', path: '/users' },
            { title: 'espresso', path: '/user/espresso' },
            { title: 'Profile' },
          ]}
        />
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
        <Radio
          options={[
            { label: 'Casual - play for fun', value: 'casual' },
            { label: 'Competitive - track results', value: 'competitive' },
            { label: 'Tournament - bracket mode', value: 'tournament' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Checkbox
          label="Finish the game setup"
          checked={done}
          onChange={setDone}
        />
        <Toggle
          label="Lobby notifications"
          description="Ping when friends join"
          checked={notifications}
          onChange={setNotifications}
        />
      </div>
    </ScrollablePage>
  );
}

export default Users;
