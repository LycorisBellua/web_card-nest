export type Suit = "hearts" | "diamonds" | "clubs" | "spades"

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7"
					| "8" | "9" | "10" | "J" | "Q" | "K"

export interface Card {
	suit: Suit;
	rank: Rank;
	// isPublic: boolean;
}

export interface Player {
	id: number;
	cards: Card[];
	score: number;
	
	hasStood: boolean;
	isBusted: boolean;
	hasBlackCrown: boolean;

	reachedAt: number;
}

export interface GameState {
	players: Player[];
	currentPlayerIdx: number;
	deck: Card[];

	turn: number;
	gameStatus: "playing" | "finished";
	winnerId: number | null;
}