export enum AdmErrMsg {
  OWN_PROFILE = 'Use the user endpoint to modify/remove your own profile.',
  WRONG_RANK = 'You may only ban/unban or modify the profile of a lower-ranking user.',
  ADMIN_OTHER = 'Only the Admin account may change the rank of another user.',
  ADMIN_PROMOTE = 'Moderators may only change their own rank to USER',
  NO_PENDING = 'The rank may not be set to PENDING',
  LOBBY_SELF = 'You may not ban/unban yourself from the lobby chat, or moderate your own messages.',
  ALREADY_BAN = 'This user is already banned.',
  NOT_BAN = 'The user is not banned.',
  JWT_RANK_INVALID = 'The rank provided by the JWT no longer matches the user.',
  MSG_NOT_FOUND = 'The requested lobby message can not be found.',
}
