import { createDeck, shuffle } from "game/logic/deck";
import { checkWinner } from "game/logic/rules";
import type { Card, GameState } from "game/logic/types";

export function nextPlayer(game: GameState) {
	const next = structuredClone(game)
	const total = next.players.length;
	const activePlayer = next.players.filter(p=>!p.isBusted)
	if (activePlayer.length === 1) {
		activePlayer[0].hasStood = true
		next.gameStatus = "finished"
		next.winnerId = checkWinner(next)
		next.turn++
		return next
	}
	for (let i = 1; i <= total; i++) {
		const nextPlayer = (next.currentPlayerIdx + i) % total
		const player = next.players[nextPlayer]
		if (!player.hasStood && !player.isBusted) {
			next.currentPlayerIdx = nextPlayer
			return next
		}
	}
	next.gameStatus = "finished"
	next.winnerId = checkWinner(next)
	next.turn++
	return next
}

export function newRoundGame(playerCount: number, game: GameState) {
	const next = structuredClone(game)
	next.players = Array.from({length: playerCount}, (_, i)=>
	({
		id: i,
		cards: [],
		score: 0,
		hasStood: false,
		isBusted: false,
		hasBlackCrown: false,
		reachedAt: -2
	}))
	next.currentPlayerIdx = 0
	next.gameStatus = "playing"
	next.winnerId = null
	if (game.deck.length > 52)
		next.deck = game.deck
	else {
		const fullDeck: Card[] = createDeck()
		const shuffledDeck: Card[] = shuffle(fullDeck)
		next.deck = shuffledDeck
	}
	return next
}