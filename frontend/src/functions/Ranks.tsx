export function CanDisciplineThisUser(
  ourRank: string,
  theirRank: string,
): boolean {
  ourRank = !ourRank ? 'guest' : ourRank.toLowerCase();
  theirRank = !theirRank ? 'guest' : theirRank.toLowerCase();

  const is_admin = ourRank == 'admin';
  const is_mod = ourRank == 'moderator';
  const other_is_admin = theirRank == 'admin';
  const other_is_mod = theirRank == 'moderator';
  if (is_admin) return !other_is_admin;
  else if (is_mod) return !other_is_admin && !other_is_mod;
  return false;
}
