import { stand, hit } from "./logic/game";
import type { GameState } from "./logic/types";
import { dealInitialCards } from "./logic/deck";
import { checkWinner } from "./logic/rules";
import { initialGame } from "./state/initialState";


export function testGame() {
	const playerCount = 4

	const game: GameState = initialGame(playerCount)
	dealInitialCards(game)

	console.log("======START======")
	console.log(game.players)

	while (game.gameStatus != "finished") {
		const player = game.players[game.currentPlayerIdx]
		console.log(`Player ${player.id} turn, score: ${player.score}`)

		if (player.score < 17) {
			console.log("→ hit")
			hit(game.currentPlayerIdx, game)
		} else {
			console.log("→ stand")
			stand(game)
		}
	}
	game.winnerId = checkWinner(game)
	if (game.winnerId != -1)
		console.log("Winner:", game.winnerId)
	else
		console.log("Nobody wins")
	return game
}