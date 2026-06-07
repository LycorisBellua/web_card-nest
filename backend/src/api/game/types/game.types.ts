export type Game = {
  gameId: string;
  seats: number;
  humans: number;
  players: Occupant[];
  timeouts: Timeout[];
  invited: Set<string>;
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
