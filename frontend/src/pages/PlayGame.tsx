import { useState } from "react"
import { PlayTableStyle, TableWrapper } from '../components/style/GameTableStyle';
import { initialGame } from "game/state/initialState";
import { dealInitialCards } from "game/logic/deck";
import { hit, stand } from "game/logic/game";
import { useGameCanvas } from "game/canvas/useGameCanvas";

function PlayGame() {
	const [started, setStarted] = useState(false)
	const [game, setGame] = useState(()=>initialGame(4))
	const {canvasRef} = useGameCanvas(game, started)
	
	function handleLocalGame() {
		setStarted(true)
		setGame(g=>dealInitialCards(g))
	}

	function handleHit(){
		setGame(g=>hit(g.currentPlayerIdx, g))
	}
	
	function handleStand() {
		setGame(g=>stand(g))
	} 

 	return (
		<div>
			{started && <>
				<TableWrapper>
					<PlayTableStyle>
						<canvas ref={canvasRef} width={900} height={600}></canvas>
					</PlayTableStyle>
					<div>
						<button onClick={handleHit}>Hit</button>
						<button onClick={handleStand}>Stand</button>
					</div>
				</TableWrapper>
			</>}
			{!started && <div>
				<button onClick={handleLocalGame}>Local game</button>
				<button>Online game</button>
			</div>}
		</div>
	)
}

export default PlayGame

	// const canvasRef = useRef<HTMLCanvasElement | null>(null)
	// const rafRef = useRef<number>(0)
	// const handRef = useRef<CanvasCard[]>([])

	// useEffect(()=>{
	// 	if (!started) 
	// 		return
	// 	const player = game.players[game.currentPlayerIdx]
	// 	console.log("current player: ", game.currentPlayerIdx)
	// 	console.log("total cards in hand: ", player.cards.length)
	// 	console.log("cards: ", player.cards.map(c=>`${c.rank}${c.suit}`))
		
	// 	const existing = new Map(handRef.current.map(c=>[c.id, c]))
	// 	console.log(existing)
	// 	handRef.current = player.cards.map((c, i) => {
	// 		const id = `p${game.currentPlayerIdx} - ${i}`
	// 		const label = `${c.rank}${suitToSymbol(c.suit)}`
	// 		const card = existing.get(id) ?? new CanvasCard(id, label, DECK_X, DECK_Y)

	// 		if (i == 0 && !existing.has(id))
	// 			card.flipped = true
	// 		return card
	// 	})

	// 	const spacing = 90
	// 	const total = (handRef.current.length - 1) * spacing
	// 	const startX = 450 - total / 2 - 40

	// 	handRef.current.forEach((card, i)=> {
	// 		card.tx = startX + i * spacing
	// 		card.ty = 460
	// 	})
	// }, [started, game])

	// useEffect(()=>{
	// 	if (!started) return
	// 	const canvas = canvasRef.current
	// 	if (!canvas) return
	// 	const ctx = canvas.getContext("2d")!
	// 	if (!ctx) return
	// 	const W = canvas.width
	// 	const H = canvas.height

	// 	let last = performance.now()
	// 	function loop(now: number) {
	// 		const dt = Math.min((now - last) / 1000, 0.033)
	// 		last = now
	// 		ctx.clearRect(0, 0, W, H)
	// 		ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
	// 		ctx.fillRect(0, 0, W, H)

	// 		handRef.current.forEach(card=>{
	// 			card.update(dt)
	// 			card.draw(ctx)
	// 		})
	// 		rafRef.current = requestAnimationFrame(loop)
	// 	}
	// 	rafRef.current = requestAnimationFrame(loop)
	// 	return ()=>cancelAnimationFrame(rafRef.current)
	// }, [started])