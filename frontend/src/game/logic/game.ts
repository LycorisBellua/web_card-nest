import type { GameState } from './types';
import { giveCard } from './deck';
import { nextPlayer } from 'game/engine/gameEngine';
import { checkWinner } from './rules';

export function hit(currentPlayerIdx: number, gameState: GameState) {
  const next = structuredClone(gameState);
  const player = next.players[currentPlayerIdx];
  giveCard(player, next);
  if (player.hasBlackCrown) {
    next.gameStatus = 'finished';
    next.turn++;
    next.winnerId = player.id;
    return next;
  }
  const allDone = next.players.every((p) => p.hasStood || p.isBusted);
  if (allDone) {
    next.gameStatus = 'finished';
    next.winnerId = checkWinner(next);
    next.turn++;
    return next;
  }
  const activePlayer = next.players.filter((p) => !p.isBusted);
  if (activePlayer.length === 1) {
    activePlayer[0].hasStood = true;
    next.gameStatus = 'finished';
    next.winnerId = checkWinner(next);
    next.turn++;
    return next;
  }
  next.gameStatus = 'transition';
  return next;
}

export function stand(game: GameState) {
  const next = structuredClone(game);
  next.players[next.currentPlayerIdx].hasStood = true;
  const allDone = next.players.every((p) => p.hasStood || p.isBusted);
  if (allDone) {
    next.gameStatus = 'finished';
    next.winnerId = checkWinner(next);
    next.turn++;
    return next;
  }
  if (next.currentPlayerIdx + 1 == game.players.length) {
    return nextPlayer(next);
  } else next.gameStatus = 'transition';
  return next;
}
