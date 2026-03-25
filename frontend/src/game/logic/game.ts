import type { GameState, Player } from "./types"
import { giveCard } from "./deck"
import { nextPlayer } from "game/engine/gameEngine"

export function hit(currentPlayerIdx: number, gameState: GameState) {
	const next = structuredClone(gameState)
	const player = next.players[currentPlayerIdx]
	giveCard(player, next)
	next.turn++
	console.log("Current player:", next.currentPlayerIdx, "choose to hit", "Status:", next.gameStatus);
	if (player.isBusted)
		nextPlayer(next)
	return next
}

export function stand(game: GameState) {
	const next = structuredClone(game)
	next.players[next.currentPlayerIdx].hasStood = true
	console.log("Current player:", next.currentPlayerIdx, "choose to stand", "Status:", next.gameStatus);
	nextPlayer(next)
	return next
}