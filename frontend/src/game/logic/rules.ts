import type { Card, GameState } from "game/logic/types";

export function calculateScore(cards: Card[]) : number {
	let score = 0
	let hasAce = 0
	for (const card of cards) {
		if (card.rank === "J" || card.rank === "Q"
			|| card.rank === "K")
			score += 10
		else if (card.rank === 'A')
			hasAce = 1
		else
			score += Number(card.rank)
	}
	if (hasAce === 1) {
		if (score <= 10)
			score += 11
		else
			score += 1
	}
	return score
}

export function checkBlackCrown(cards: Card[]) : boolean {
	if (cards.length != 2)
		return false
	if (calculateScore(cards) != 21)
		return false
	const ranks = cards.map(c=>c.rank)
	return ranks.includes('A') && ranks.some(v=>
		v === '10' || v === "J" || v === "Q" || v === "K")
}

export function checkWinner(game: GameState): number {
	console.log("check winner is called")
	const validPlayer = game.players.filter(player=>!player.isBusted)
	if (validPlayer.length == 0)
		return -1
	console.log("valide players are: ", validPlayer.length)
	const blackCrown = validPlayer.filter(player=>player.hasBlackCrown)
	if (blackCrown.length > 0) {
		if (blackCrown.length == 1) {
			console.log(blackCrown[0].id)
			return blackCrown[0].id
		}
		else {
			blackCrown.sort((a, b)=>a.reachedAt - b.reachedAt)
			console.log(blackCrown[0].id)
			return blackCrown[0].id
		}
	}
	console.log("No Blackjack")
	validPlayer.sort((a, b)=> {
		if (a.score != b.score)
			return b.score - a.score
		else {
			if (a.reachedAt != b.reachedAt)
				return a.reachedAt - b.reachedAt
			else
				return -1
		}
	})
	console.log(validPlayer)
	console.log("the winner is : ", validPlayer[0].id)
	return validPlayer[0].id
}