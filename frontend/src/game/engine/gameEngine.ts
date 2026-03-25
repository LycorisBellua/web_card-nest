import { checkWinner } from "game/logic/rules";
import type { GameState } from "game/logic/types";

export function nextPlayer(game: GameState) {
	console.log("nextPlayer called, currentPlayerIdx=", game.currentPlayerIdx)
	const total = game.players.length;
	const activePlayer = game.players.filter(p=>!p.isBusted)
	if (activePlayer.length === 0) {
		game.gameStatus = "finished"
		game.winnerId = checkWinner(game)
		console.log(game.winnerId)
		return
	}
	if (activePlayer.length === 1) {
		activePlayer[0].hasStood = true
		game.gameStatus = "finished"
		game.winnerId = checkWinner(game)
		console.log(game.winnerId)
		return
	}
	for (let i = 1; i <= total; i++) {
		const next = (game.currentPlayerIdx + i) % total
		const player = game.players[next]
		if (!player.hasStood && !player.isBusted) {
			game.currentPlayerIdx = next
			return
		}
	}
	game.gameStatus = "finished"
	game.winnerId = checkWinner(game)
	console.log(game.winnerId)
}