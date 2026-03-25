import type { Card, GameState } from '../logic/types';
import { createDeck, shuffle } from 'game/logic/deck';

export function initialGame(playerCount: number) : GameState {
	const fullDeck: Card[] = createDeck()
	const shuffledDeck: Card[] = shuffle(fullDeck)
	return {
		players: Array.from({length: playerCount}, (_, i)=>
		({
			id: i,
			cards: [],
			score: 0,
			hasStood: false,
			isBusted: false,
			hasBlackCrown: false,
			reachedAt: -1
		})),
		currentPlayerIdx: 0,
		deck: shuffledDeck,
		turn: 0,
		gameStatus: "playing",
		winnerId: null,
	}
}