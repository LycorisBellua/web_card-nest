import { useState } from "react"
import { PlayTableStyle, TableWrapper, PlayerCountStyle, Overlay } from '../components/style/GameTableStyle';
import { initialGame } from "game/state/initialState";
import { dealInitialCards } from "game/logic/deck";
import { hit, stand } from "game/logic/game";
import { useGameCanvas } from "game/canvas/useGameCanvas";
import type { GameState } from "game/logic/types";
import { nextPlayer } from "game/engine/gameEngine";

function PlayGame() {
	const [started, setStarted] = useState(false)
	const [local, setLocal] = useState(false)
	const [online, setOnline] = useState(false)
	const [game, setGame] = useState<GameState | null>(null)
	const {canvasRef} = useGameCanvas(game, started)
	
	function handleLocalGame() {
		setLocal(true)
	}

	function handleOnlineGame() {
		setOnline(true)
	}

	function handleStartLocalGame(playerCount: number) {
		setStarted(true)
		setGame(()=>{
			const g = initialGame(playerCount)
			return dealInitialCards(g)
		})
	}

	function handleStartOnlineGame(playerCount: number) {
		setStarted(true)
		setGame(()=>{
			const g = initialGame(playerCount)
			return dealInitialCards(g)
		})
	}

	function handleHit(){
		setGame(g=>{
			if (!g) return g
			return hit(g.currentPlayerIdx, g)
		})
	}
	
	function handleStand() {
		setGame(g=>{
			if (!g) return g
			const next = stand(g)
			return next
		})
	}

	function handleNextPlayer() {
		setGame(g=>{
			if (!g) return g
			const next = nextPlayer(g)
			if (next.gameStatus === "transition")
				next.gameStatus = "playing"
			return next
		})
	}

 	return (
		<div>
			{started
				&& game && <>
					<TableWrapper>
						{game?.gameStatus === "transition" && (
							<Overlay>
								<p>👉 Change to Player {(game.currentPlayerIdx + 1) % game.players.length + 1}</p>
								<button onClick={handleNextPlayer}>Confirm</button>
							</Overlay>
						)}
						{game?.gameStatus === "finished" && (
							<Overlay>
								<p>👉 Winner is Player {game.winnerId! + 1}</p>
							</Overlay>
						)}
						<PlayTableStyle>
							<canvas ref={canvasRef} width={900} height={600}></canvas>
						</PlayTableStyle>
						<div className="btn">
							<button onClick={handleHit}>Hit</button>
							<button onClick={handleStand}>Stand</button>
						</div>
					</TableWrapper>
				</>
			}
			{!local && !online
				&& <div>
					<button onClick={handleLocalGame}>Local game</button>
					<button onClick={handleOnlineGame}>Online game</button>
				</div>
			}
			{(local || online) && !started
				&& <PlayerCount local = {local} onStartLocalGame={handleStartLocalGame} onStartOnlineGame={handleStartOnlineGame}/>
			}
		</div>
	)
}

type PlayerCountProps = {
	local: boolean;
	onStartLocalGame: (playerCount: number)=>void;
	onStartOnlineGame: (playerCount: number)=>void;
}

function PlayerCount({local, onStartLocalGame, onStartOnlineGame}: PlayerCountProps) {
	return (
		<PlayerCountStyle>
			<button onClick={()=>{local ? onStartLocalGame(2) : onStartOnlineGame(2)}}>1 v 1</button>
			<button onClick={()=>{local ? onStartLocalGame(3) : onStartOnlineGame(3)}}>1 v 1 v 1</button>
			<button onClick={()=>{local ? onStartLocalGame(4) : onStartOnlineGame(4)}}>1 v 1 v 1 v 1</button>
		</PlayerCountStyle>
	)
}

export default PlayGame