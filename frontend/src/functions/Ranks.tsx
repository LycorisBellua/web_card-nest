import { useUser } from 'context/useUser';

export function IsLoggedIn(): boolean {
  const { user } = useUser();
  return !!user;
}

export function IsPendingUser(): boolean {
  const { user } = useUser();
  return !!user && !user.email;
}
