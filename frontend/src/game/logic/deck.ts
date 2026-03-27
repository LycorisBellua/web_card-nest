import { calculateScore, checkBlackCrown } from "./rules";
import type { Suit, Rank, Player, Card, GameState } from '../logic/types';

export function createDeck() : Card[] {
	const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"]
	const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

	const deck : Card[] = []

	for (const suit of suits) {
		for (const rank of ranks) {
			deck.push({suit, rank})
		}
	}
	return deck
}

// fisher-yates algorithm
export function shuffle(deck: Card[]): Card[] {
	const newDeck : Card[] = [...deck]
	for (let i = newDeck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		let tmp = newDeck[j]
		newDeck[j] = newDeck[i]
		newDeck[i] = tmp
	}
	return newDeck
}

export function giveCard(player: Player, gameState : GameState) {
	if (player.hasStood)
		return
	const card = gameState.deck.pop()!
	player.cards.push(card)
	const newScore = calculateScore(player.cards)
	player.reachedAt++
	console.log(`for ${player.id}, this is ${player.reachedAt} turns`)
	player.score = newScore
	if (player.score > 21) {
		player.isBusted = true
		return
	}
	player.hasBlackCrown = checkBlackCrown(player.cards)
}

export function dealInitialCards(gameState: GameState) {
	const next = structuredClone(gameState)
	for (let round = 0; round < 2; round++) {
		for (let i = 0; i < next.players.length; i++) {
			giveCard(next.players[i], next)
		}
	}
	return next
}