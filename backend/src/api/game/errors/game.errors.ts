export enum GameErr {
  SEATS = 'The number of seats must be between 1 and 4.',
  ALREADY_IN_GAME = 'The user is already in a game.',
  NOT_IN_GAME = 'The user is not in a game.',
  GAME_NOT_FOUND = 'The requested game was not found.',
  NO_SEAT_AVAILABLE = 'There is no available seat in this game.',
}
