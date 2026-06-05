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

export interface Card {
  suit: Suit;
  value: Value;
}

export type Controller =
  | { type: 'human'; id: string }
  | { type: 'bot'; id: null };

export type Status = 'active' | 'waiting' | 'stood' | 'bust';

export type PlayerState = {
  seat: number;
  hand: Card[];
  status: Status;
  controller: Controller;
  score: number;
};

export type GameState = {
  gameId: string;
  seats: number;
  players: PlayerState[];
  turnIndex: number;
};
