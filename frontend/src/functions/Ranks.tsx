import type { UserLimitedOrGuest } from 'context/Types';

export function CanDisciplineThisUser(
  user: UserLimitedOrGuest,
  otherUser: UserLimitedOrGuest,
): boolean {
  const is_admin = !!user && user.rank.toLowerCase() == 'admin';
  const is_mod = !!user && user.rank.toLowerCase() == 'mod';
  const other_is_admin = !!otherUser && otherUser.rank.toLowerCase() == 'admin';
  const other_is_mod = !!otherUser && otherUser.rank.toLowerCase() == 'mod';
  if (is_admin) return !other_is_admin;
  else if (is_mod) return !other_is_admin && !other_is_mod;
  return false;
}
