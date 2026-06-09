export enum GameErr {
  SEATS = 'The number of seats must be between 1 and 4.',
  ALREADY_IN_GAME = 'The user is already in a game.',
  NOT_IN_GAME = 'The user is not in a game.',
  GAME_NOT_FOUND = 'The requested game was not found.',
  NO_SEAT_AVAILABLE = 'There is no available seat in this game.',
  TIMED_OUT = 'The user has timed out and cannot rejoin.',
  NOT_LEADER = 'Only the game leader may invite other players to join.',
  GAME_STARTED = 'This game has already started.',
  NOT_INVITED = 'You do not have an invite to this game,',
  ONLY_LEADER_INVITE = 'Only the game leader may invite another user to the game.',
}
