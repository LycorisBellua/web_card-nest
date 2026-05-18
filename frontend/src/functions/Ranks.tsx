import type { UserLimitedOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';

export function IsLoggedIn(): boolean {
  const { user } = useUser();
  return !!user;
}

export function IsPendingUser(): boolean {
  const { user } = useUser();
  return !!user && !user.email;
}

export function IsAdmin(): boolean {
  const { user } = useUser();
  return !!user && user.rank.toLowerCase() == 'admin';
}

export function CanDisciplineThisUser(otherUser: UserLimitedOrGuest): boolean {
  const { user } = useUser();
  const is_admin = !!user && user.rank.toLowerCase() == 'admin';
  const is_mod = !!user && user.rank.toLowerCase() == 'mod';
  const other_is_admin = !!otherUser && otherUser.rank.toLowerCase() == 'admin';
  const other_is_mod = !!otherUser && otherUser.rank.toLowerCase() == 'mod';
  if (is_admin) return !other_is_admin;
  else if (is_mod) return !other_is_admin && !other_is_mod;
  return false;
}
