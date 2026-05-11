import type { Card, GameState } from '../logic/types';
import { createDeck, shuffle } from 'game/logic/deck';

// start a game
export function initialGame(
  playerCount: number,
  currentUser?: { username: string },
): GameState {
  const fullDeck: Card[] = createDeck();
  const shuffledDeck: Card[] = shuffle(fullDeck);
  return {
    players: Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      username: i === 0 ? (currentUser?.username ?? null) : null,
      cards: [],
      score: 0,
      hasStood: false,
      isBusted: false,
      hasBlackCrown: false,
      reachedAt: -2,
    })),
    currentPlayerIdx: 0,
    deck: shuffledDeck,
    turn: 0,
    gameStatus: 'playing',
    winnerId: null,
  };
}
