import type { OtherUserOrGuest } from 'context/Types';

export function CanDisciplineThisUser(
  user: OtherUserOrGuest,
  otherUser: OtherUserOrGuest,
): boolean {
  const is_admin = !!user && user.rank.toLowerCase() == 'admin';
  const is_mod = !!user && user.rank.toLowerCase() == 'moderator';
  const other_is_admin = !!otherUser && otherUser.rank.toLowerCase() == 'admin';
  const other_is_mod =
    !!otherUser && otherUser.rank.toLowerCase() == 'moderator';
  if (is_admin) return !other_is_admin;
  else if (is_mod) return !other_is_admin && !other_is_mod;
  return false;
}
