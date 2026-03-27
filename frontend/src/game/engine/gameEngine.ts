import { checkWinner } from "game/logic/rules";
import type { GameState } from "game/logic/types";

export function nextPlayer(game: GameState) {
	const next = structuredClone(game)
	console.log("nextPlayer called, currentPlayerIdx=", game.currentPlayerIdx)
	const total = next.players.length;
	const activePlayer = next.players.filter(p=>!p.isBusted)
	if (activePlayer.length === 0) {
		next.gameStatus = "finished"
		next.winnerId = checkWinner(game)
		next.turn++
		console.log("return 1", next.turn, next.gameStatus, next.winnerId)
		return next
	}
	if (activePlayer.length === 1) {
		activePlayer[0].hasStood = true
		next.gameStatus = "finished"
		next.winnerId = checkWinner(game)
		next.turn++
		console.log("return 2",  next.turn, next.gameStatus, next.winnerId)
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
	next.winnerId = checkWinner(game)
	next.turn++
	console.log("return 3", next.turn, next.gameStatus, next.winnerId)
	return next
}