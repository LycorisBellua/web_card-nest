export enum AdmErrMsg {
  OWN_PROFILE = 'Use the user endpoint to modify/remove your own profile.',
  WRONG_RANK = 'You may only modify the profile of a lower-ranking user.',
  ADMIN_OTHER = 'Only the Admin account may change the rank of another user.',
  ADMIN_PROMOTE = 'Moderators may only change their own rank to USER',
  NO_PENDING = 'The rank may not be set to PENDING',
}
