import type { GameState } from "./types"
import { giveCard } from "./deck"
import { nextPlayer } from "game/engine/gameEngine"

export function hit(currentPlayerIdx: number, gameState: GameState) {
	const next = structuredClone(gameState)
	const player = next.players[currentPlayerIdx]
	giveCard(player, next)
	console.log("Current player:", next.currentPlayerIdx, "choose to hit", "Status:", next.gameStatus);
	if (player.isBusted) {
		next.gameStatus = "transition"
	}
	return next
}

export function stand(game: GameState) {
	const next = structuredClone(game)
	next.players[next.currentPlayerIdx].hasStood = true
	if (next.currentPlayerIdx + 1 == game.players.length) {
		return nextPlayer(next)
	} else
		next.gameStatus = "transition"
	return next
}