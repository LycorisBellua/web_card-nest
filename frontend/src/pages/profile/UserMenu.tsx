import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'context/useUser';
import UserBtn from 'components/btn/user_btn/UserBtn';
import UserBtnBase from 'components/btn/user_btn/UserBtnBase';
import { Wrapper, Menu, Option } from 'components/btn/user_btn/UserMenuStyle';

function UserMenu() {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!user) {
    return <UserBtn user={null} path="/auth" />;
  }

  const handleSettings = async () => {
    setOpen(false);
    await navigate('/profile');
  };

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' }).catch(
      () => null,
    );
    if (!res?.ok) {
      return;
    }
    setOpen(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Wrapper ref={ref}>
      <UserBtnBase user={user} onClick={() => setOpen((prev) => !prev)} />
      <Menu $open={open}>
        <Option onClick={() => void handleSettings()}>Settings</Option>
        <Option $destructive onClick={() => void handleLogout()}>
          Log Out
        </Option>
      </Menu>
    </Wrapper>
  );
}

export default UserMenu;
