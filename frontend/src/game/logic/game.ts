import type { GameState } from "./types"
import { giveCard } from "./deck"
import { nextPlayer } from "game/engine/gameEngine"

export function hit(currentPlayerIdx: number, gameState: GameState) {
	const next = structuredClone(gameState)
	const player = next.players[currentPlayerIdx]
	giveCard(player, next)
	if (player.hasBlackCrown) {
        next.gameStatus = "finished"
        next.winnerId = player.id
        return next
    }
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