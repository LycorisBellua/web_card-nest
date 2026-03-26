import type { GameState } from "game/logic/types"
import { useEffect, useRef } from "react"
import { CanvasCard } from "./CanvasCard"
import { suitToSymbol } from "./cardTextures"

const DECK_X = 780
const DECK_Y = 240
const W = 900
const H = 600
const CARD_W = 80
const CARD_H = 120

function	getRelativeIndex(playerIdx: number, currentPlayerIdx: number, total: number) {
	return (playerIdx - currentPlayerIdx + total) % total
}

function	getPlayerPosition(relativeIndex: number, total: number) {
	if (total === 2)
		return relativeIndex === 0? "bottom" : "top"
	if (total === 3)
		return ["bottom", "right", "left"][relativeIndex]
	if (total === 4)
		return ["bottom", "right", "top", "left"][relativeIndex]
}

export function useGameCanvas(game: GameState | null, started: boolean) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const rafRef = useRef<number>(0)
	const allRef = useRef<CanvasCard[][]>([])
	const gameRef = useRef(game)
	const revealedRef = useRef(false)

	useEffect(()=>{
		if (!game) return 
		gameRef.current = game
	}, [game])

	useEffect(()=>{
		if (!started || !game) 
			return
		allRef.current = game.players.map((player, playerIdx)=> {
			const existing = new Map(
				(allRef.current[playerIdx] ?? []).map(c=>[c.id, c])
			)

			const cards = player.cards.map((c, i)=>{
				const id = `p${playerIdx}-${i}`
				const label = `${c.rank}${suitToSymbol(c.suit)}`
				const card = existing.get(id)?? new CanvasCard(id, label, DECK_X, DECK_Y)
				
				if (i == 1 && !existing.has(id))
					card.flipped = true
				return card
			})
			
			const relativeIndex = getRelativeIndex(playerIdx, game.currentPlayerIdx, game.players.length)
			const position = getPlayerPosition(relativeIndex, game.players.length)
			const spacing = 90
			const total = (cards.length - 1) * spacing
			let startX = 0
			let startY = 0
			if (position === "top" || position === "bottom") {
				startX = W / 2 - total / 2 - CARD_W / 2
				if (position === "bottom")
					startY = H - CARD_H - 20
				else
					startY = 20
				cards.forEach((c, i)=>{
					c.tx = startX + i * spacing
					c.ty = startY
				})
			} else {
				startY = H / 2 - total / 2 - CARD_H / 2
				if (position === "left")
					startX = 20
				else
					startX = W - CARD_W - 20
				cards.forEach((c, i)=>{
					c.tx = startX
					c.ty = startY + i * spacing	
				})	
			}
			return cards
		})
	}, [started, game])

	useEffect(()=>{
		if (!started || !game) return
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")!
		if (!ctx) return
		const W = canvas.width
		const H = canvas.height
		
		let last = performance.now()
		function loop(now: number) {
			const dt = Math.min((now - last) / 1000, 0.033)
			last = now
			
			ctx.clearRect(0, 0, W, H)
			ctx.fillStyle = "rgba(0, 0, 0, 0)"
			ctx.fillRect(0, 0, W, H)
			
			allRef.current.forEach((playerCards, playerIdx)=>{
				const isCurrent = playerIdx === gameRef.current!.currentPlayerIdx
				playerCards.forEach((card, i)=>{
					if (gameRef.current!.gameStatus !== "finished") {
						if (isCurrent)
							card.flipped = false
						else
							if (i === 1)
								card.flipped = true
					} else {
						card.flipped = false
					}
					card.update(dt)
					card.draw(ctx, isCurrent)
				})
				const label = `Player ${playerIdx + 1}`
    			ctx.save()
    			ctx.font = "bold 16px Arial"
    			ctx.fillStyle = isCurrent ? "#FFD700" : "rgba(255,255,255,0.8)"  // 当前玩家金色
    			ctx.textAlign = "center"
				const relativeIndex = getRelativeIndex(playerIdx, gameRef.current!.currentPlayerIdx, gameRef.current!.players.length)
				const position = getPlayerPosition(relativeIndex, gameRef.current!.players.length)	
    			if (position === "bottom") {
    			    ctx.fillText(label, W / 2, H - CARD_H - 35)
    			} else if (position === "top") {
    			    ctx.fillText(label, W / 2, CARD_H + 45)
    			} else if (position === "left") {
    			    ctx.fillText(label, CARD_W + 60, H / 2)
    			} else if (position === "right") {
    			    ctx.fillText(label, W - CARD_W - 60, H / 2)
    			}
    			ctx.restore()
			})
			ctx.restore()
			rafRef.current = requestAnimationFrame(loop)
		}
		rafRef.current = requestAnimationFrame(loop)
		return ()=>cancelAnimationFrame(rafRef.current)
	}, [started])

	useEffect(()=>{
		if (!game) return
		if (game.gameStatus === "finished" && !revealedRef.current) {
			revealedRef.current = true
			allRef.current.forEach(playerCards=>{
				playerCards.forEach(card=>{
					card.flipped = false
				})
			})
		}
	}, [game])
	return { canvasRef }
}