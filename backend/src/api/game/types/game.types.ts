export type Game = {
  gameId: string;
  seats: number;
  humans: number;
  players: Occupant[];
  timeouts: Timeout[];
  // userId -> username of players invited but not yet seated
  invited: Map<string, string>;
  // userId -> username for everyone known to this game (leader + seated +
  // invited). Unlike `invited`, entries here are NOT removed when a player
  // takes a seat, so the client can always resolve a display name.
  names: Map<string, string>;
  leader: string;
};

export type Occupant =
  | { type: 'human'; id: string }
  | { type: 'bot'; id: 'bot' };

export type Timeout = {
  occupant: Occupant;
  timer: number;
  seat: number;
  leader: boolean;
};

export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

export type Value =
  | 'A'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export type Card = {
  suit: Suit;
  value: Value;
};

export type Status = 'active' | 'waiting' | 'stood' | 'bust';

export type PlayerState = {
  seat: number;
  hand: Card[];
  status: Status;
};

export type GameState = {
  turnIndex: number;
  players: PlayerState[];
};
