import { useUser } from 'context/useUser';

export function IsLoggedIn(): boolean {
  const { user } = useUser();
  return !!user;
}
