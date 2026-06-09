import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from 'game/logic/types';
import { CanvasCard } from 'game/canvas/CanvasCard';
import { suitToSymbol } from 'game/canvas/cardTextures';

const DECK_X = 780;
const DECK_Y = 240;
const W = 900;
const H = 600;
const CARD_W = 80;
const CARD_H = 120;

function getRelativeIndex(
  playerIdx: number,
  currentPlayerIdx: number,
  total: number,
) {
  return (playerIdx - currentPlayerIdx + total) % total;
}

function getPlayerPosition(relativeIndex: number, total: number) {
  if (total === 2) return relativeIndex === 0 ? 'bottom' : 'top';
  if (total === 3) return ['bottom', 'right', 'left'][relativeIndex];
  if (total === 4) return ['bottom', 'right', 'top', 'left'][relativeIndex];
}

/**
 * @param game             Current game state.
 * @param started          Whether the game has started.
 * @param localPlayer      Index of the local player.  Pass `null` in local
 *                         (hotseat) mode: the current player's cards are always
 *                         fully visible, and all cards are revealed at round end.
 *                         Pass a player index (e.g. `0`) in online mode: other
 *                         players' second card (index 1) stays hidden during play,
 *                         but every card is revealed once the round finishes.
 * @param hideOtherScores  When `true`, other players' real score is never shown
 *                         during play — only the visible-card estimate is displayed.
 *                         At game end all scores are revealed regardless.  Use in
 *                         online mode so the local player cannot infer the hidden card.
 */
export function useGameCanvas(
  game: GameState | null,
  started: boolean,
  localPlayer: number | null = null,
  hideOtherScores = false,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const allRef = useRef<CanvasCard[][]>([]);
  const gameRef = useRef(game);
  const revealedRef = useRef(false);

  // Store these in refs so effects that read them don't need them as deps.
  // They are stable for the lifetime of a game session.
  const isOnlineMode = localPlayer !== null;
  const localPlayerRef = useRef(localPlayer);
  const isOnlineModeRef = useRef(isOnlineMode);
  const hideOtherScoresRef = useRef(hideOtherScores);

  // canvasReady flips to true when the canvas element mounts. This ensures
  // the render loop effect re-runs after an isAuthLoading-gated return null
  // caused the canvas to be absent on the first render.
  const [canvasReady, setCanvasReady] = useState(false);
  const setCanvasRef = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el;
    setCanvasReady(el !== null);
  }, []);
  useEffect(() => {
    localPlayerRef.current = localPlayer;
  }, [localPlayer]);
  useEffect(() => {
    isOnlineModeRef.current = isOnlineMode;
  }, [isOnlineMode]);
  useEffect(() => {
    hideOtherScoresRef.current = hideOtherScores;
  }, [hideOtherScores]);

  useEffect(() => {
    if (!game) return;
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    if (!started || !game) return;
    allRef.current = game.players.map((player, playerIdx) => {
      const existing = new Map(
        (allRef.current[playerIdx] ?? []).map((c) => [c.id, c]),
      );

      const cards = player.cards.map((c, i) => {
        const id = `p${playerIdx}-${i}`;
        const label = `${c.rank}${suitToSymbol(c.suit)}`;
        const card =
          existing.get(id) ?? new CanvasCard(id, label, DECK_X, DECK_Y);

        // In online mode, non-local players start with their second card hidden
        // and it never gets revealed (even at game end).
        if (i === 1 && !existing.has(id)) {
          card.flipped = isOnlineModeRef.current
            ? playerIdx !== localPlayerRef.current
            : true;
        }
        return card;
      });

      const relativeIndex = getRelativeIndex(
        playerIdx,
        game.currentPlayerIdx,
        game.players.length,
      );
      const position = getPlayerPosition(relativeIndex, game.players.length);
      const spacing = 90;
      const total = (cards.length - 1) * spacing;
      let startX = 0;
      let startY = 0;

      if (position === 'top' || position === 'bottom') {
        startX = W / 2 - total / 2 - CARD_W / 2;
        if (position === 'bottom') startY = H - CARD_H - 20;
        else startY = 20;
        cards.forEach((c, i) => {
          c.rotation = 0;
          c.tx = startX + i * spacing;
          c.ty = startY;
        });
      } else {
        if (position === 'left') {
          startX = 40;
          startY = H / 2 - total / 2 - CARD_H / 2;
          cards.forEach((c, i) => {
            c.rotation = Math.PI / 2;
            c.tx = startX;
            c.ty = startY + i * spacing;
          });
        } else {
          startX = W - CARD_H;
          startY = H / 2 - total / 2 - CARD_H / 2;
          cards.forEach((c, i) => {
            c.rotation = -Math.PI / 2;
            c.tx = startX;
            c.ty = startY + i * spacing;
          });
        }
      }
      return cards;
    });
  }, [started, game]);

  function getVisiblePoints(playerIdx: number): string {
    const player = gameRef.current!.players[playerIdx];
    const visibleCards = player.cards.filter((_, i) => i !== 1);
    let points = 0;
    let hasAces = false;

    visibleCards.forEach((card) => {
      if (card.rank === 'A') {
        points += 1;
        hasAces = true;
      } else if (
        card.rank === '10' ||
        card.rank === 'J' ||
        card.rank === 'Q' ||
        card.rank === 'K'
      ) {
        points += 10;
      } else {
        points += Number(card.rank);
      }
    });

    if (hasAces && points + 10 <= 21) return `${points}+ or ${points + 10}+`;
    return `${points}+`;
  }

  useEffect(() => {
    if (!started || !game) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    let last = performance.now();

    function loop(now: number) {
      // On a refresh, the layout effect and the render loop effect fire on the
      // same tick. If allRef isn't populated yet, skip this frame and retry.
      if (allRef.current.length === 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, W, H);

      allRef.current.forEach((playerCards, playerIdx) => {
        let isCurrent = playerIdx === gameRef.current!.currentPlayerIdx;

        playerCards.forEach((card, i) => {
          if (gameRef.current!.gameStatus !== 'finished') {
            if (isCurrent) {
              // Always show the current player's own cards
              if (
                !isOnlineModeRef.current ||
                playerIdx === localPlayerRef.current
              ) {
                card.flipped = false;
              } else {
                // In online mode, other "current" players: only show card 0
                if (i === 1) card.flipped = true;
              }
            } else {
              if (i === 1) {
                // In online mode, hide other players' second card during play.
                card.flipped = isOnlineModeRef.current
                  ? playerIdx !== localPlayerRef.current
                  : true;
              }
            }
          } else {
            // Game finished: reveal every card regardless of mode.
            card.flipped = false;
            isCurrent = false;
          }

          card.update(dt);
          card.draw(ctx, isCurrent);
        });

        const player = gameRef.current!.players[playerIdx];
        const playerName = player.username
          ? `#${playerIdx + 1} ${player.username}`
          : `#${playerIdx + 1} Player`;

        let label = '';
        const crown = player.hasBlackCrown ? '👑​' : '';
        const isFinished = gameRef.current!.gameStatus === 'finished';
        // In online mode, only the local player sees their own real score
        // during play. Other players only show the visible-card estimate.
        // At game end everyone's real score is shown regardless.
        const isLocalPlayer =
          !isOnlineModeRef.current || playerIdx === localPlayerRef.current;
        const showRealScore =
          isFinished || isLocalPlayer || !hideOtherScoresRef.current;

        if (isFinished) {
          label = `${playerName} : ${player.score} ${crown}`;
        } else if (showRealScore) {
          label = `${playerName} : ${getVisiblePoints(playerIdx)} ( ${player.score} ${crown})`;
        } else {
          label = `${playerName} : ${getVisiblePoints(playerIdx)}`;
        }

        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = isCurrent ? '#FFD700' : 'rgba(255,255,255,0.8)';
        ctx.textAlign = 'center';

        const relativeIndex = getRelativeIndex(
          playerIdx,
          gameRef.current!.currentPlayerIdx,
          gameRef.current!.players.length,
        );
        const position = getPlayerPosition(
          relativeIndex,
          gameRef.current!.players.length,
        );

        let labelX = 0;
        let labelY = 0;
        if (position === 'bottom') {
          labelX = W / 2;
          labelY = H - CARD_H - 55;
        } else if (position === 'top') {
          labelX = W / 2;
          labelY = CARD_H + 55;
        } else if (position === 'left') {
          labelX = CARD_W + 120;
          labelY = H / 2;
        } else if (position === 'right') {
          labelX = W - CARD_W - 120;
          labelY = H / 2;
        }

        const displayLabel =
          position === 'left' ? label : position === 'right' ? label : label;
        ctx.fillText(displayLabel, labelX, labelY);

        const displayStatus = (s: string) =>
          position === 'left' ? s : position === 'right' ? s : s;

        if (gameRef.current!.players[playerIdx].isBusted) {
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = '#c0110f';
          ctx.fillText(displayStatus('BUST'), labelX, labelY + 20);
        } else if (
          gameRef.current!.gameStatus !== 'finished' &&
          gameRef.current!.players[playerIdx].hasStood
        ) {
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText(displayStatus('STAND'), labelX, labelY + 20);
        }

        if (gameRef.current!.players[playerIdx].hasBlackCrown) {
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = '#b253ff';
          let bcLabelX = labelX;
          if (position === 'left') {
            bcLabelX = CARD_W + 92 + 40;
          } else if (position === 'right') {
            bcLabelX = W - CARD_W - 92 - 40;
          }
          ctx.fillText(displayStatus('BLACKCROWN'), bcLabelX, labelY + 20);
        }

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [game, started, canvasReady]);

  useEffect(() => {
    if (!game) return;
    if (game.gameStatus === 'finished' && !revealedRef.current) {
      revealedRef.current = true;
      allRef.current.forEach((playerCards, playerIdx) => {
        const isWinner = playerIdx === game.winnerId;
        playerCards.forEach((card) => {
          card.flipped = false;
          card.isWinner = isWinner;
        });
      });
    }
  }, [game]);

  const reset = () => {
    allRef.current = [];
    revealedRef.current = false;
  };

  return { canvasRef: setCanvasRef, reset };
}
