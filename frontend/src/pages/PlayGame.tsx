import { useEffect, useState } from "react"
import { PlayTableStyle, TableWrapper, PlayerCountStyle, Overlay, RecordTableStyle, ShowFinishedStyle} from '../components/style/GameTableStyle';
import { initialGame } from "game/state/initialState";
import { dealInitialCards } from "game/logic/deck";
import { hit, stand } from "game/logic/game";
import { useGameCanvas } from "game/canvas/useGameCanvas";
import type { GameState } from "game/logic/types";
import { newRoundGame, nextPlayer } from "game/engine/gameEngine";

type RoundRecord = {
	round: number;
	winnerId: number | null;
	scores: number[];
}

function PlayGame() {
	const [started, setStarted] = useState(false)
	const [local, setLocal] = useState(false)
	const [online, setOnline] = useState(false)
	const [game, setGame] = useState<GameState | null>(null)
	const [history, setHistory] = useState<RoundRecord[]>([])
	const [displayRecord, setDisplayRecord] = useState(false)
	const [showFinished, setShowFinished] = useState(false)
	const {canvasRef, reset} = useGameCanvas(game, started)

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

	function handleNewRound() {
		if (!game) return
		setHistory((h)=>[...h, {
			round: game.turn,
			winnerId: game.winnerId,
			scores: game.players.map(p=>p.score)
		}])
		const playerCount = game.players.length
		reset()
		const newGame = newRoundGame(playerCount, game)
		setGame(dealInitialCards(newGame))
	}

	function handleDisplayRecord() {
		if (!game) return
		setHistory((h)=>[...h, {
			round: game.turn,
			winnerId: game.winnerId,
			scores: game.players.map(p=>p.score)
		}])
		setStarted(false)
		if (local)
			setLocal(false)
		if (online)
			setOnline(false)
		setDisplayRecord(true)
	}

	useEffect(()=>{
		if (!game) return
		if (game.gameStatus == "finished") {
			const timer = setTimeout(()=>{
				setShowFinished(true)
			}, 5000)
			return (()=>clearTimeout(timer))
		} else {
			setShowFinished(false)
		}
	}, [game?.gameStatus])

 	return (
		<div>
			{started
				&& game && <>
					<TableWrapper>
						{game?.gameStatus === "transition" && (
							<Overlay>
								{game.players[game.currentPlayerIdx].isBusted && <p>You're busted!</p>}
								<p>Change to Player {(game.currentPlayerIdx + 1) % game.players.length + 1}</p>
								<button onClick={handleNextPlayer}>Confirm</button>
							</Overlay>
						)}
						{showFinished && game?.gameStatus === "finished" && (
							<ShowFinishedStyle>
								<p>Round {game.turn}: winner is player {game.winnerId! + 1}</p>
								<div className="btn">
									<button onClick={handleNewRound}>Another turn</button>
									<button onClick={handleDisplayRecord}>Stop playing</button>
								</div>
							</ShowFinishedStyle>
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
			{!local && !online && !displayRecord
				&& <div>
					<button onClick={handleLocalGame}>Local game</button>
					<button onClick={handleOnlineGame}>Online game</button>
				</div>
			}
			{(local || online) && !started &&
				<PlayerCount local = {local} onStartLocalGame={handleStartLocalGame} onStartOnlineGame={handleStartOnlineGame}/>
			}
			{!started && displayRecord && !local && !online &&
				<DisplayRecord game={game} history={history}/>
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

type DisplayRecordProps = {
	game: GameState | null;
	history: RoundRecord[];
}

function DisplayRecord({game, history}: DisplayRecordProps) {
	if (!game) {
        return (
            <Overlay>
                <div style={{ color: 'white', textAlign: 'center' }}>
                    <h2>No records yet.</h2>
                    <button onClick={() => window.location.reload()}>Back</button>
                </div>
            </Overlay>
        );
    }
	return (
		<Overlay>
			<RecordTableStyle>
				<thead>
					<tr>
						<th>Round</th>
						{game.players.map((p, i)=>(
							<th key={i}>Player {p.id + 1}</th>
						))}
						<th>Winner</th>
					</tr>
				</thead>
				<tbody>
				{history.map((h, idx)=>(
					<tr key={idx}>
						<td>{h.round}</td>
						{h.scores.map((score, sIdx)=>(
							<td key={sIdx}>{game.players[sIdx].hasBlackCrown? "Black Crown" : score}</td>
						))}
						<td>{h.winnerId! + 1}</td>
					</tr>
				))}
				</tbody>
			</RecordTableStyle>
			<button onClick={() => window.location.reload()}>Back</button>
		</Overlay>
	)
}

export default PlayGame