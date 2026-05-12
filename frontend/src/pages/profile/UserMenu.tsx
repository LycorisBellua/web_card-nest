import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { BtnAccent } from 'components/btn/Btn';
import UserBtn from 'components/btn/UserBtn';
import UserBtnBase from 'components/btn/UserBtnBase';
import { Wrapper, Menu, Option } from 'components/btn/UserMenuStyle';

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
    return <Link to="/auth"><BtnAccent>Log In</BtnAccent></Link>;
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
