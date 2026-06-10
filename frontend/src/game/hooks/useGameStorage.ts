import { useState, useEffect } from 'react';
import type { GameState } from 'game/logic/types';

function loadGame(key: string): GameState | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

function saveGame(key: string, game: GameState | null) {
  if (game === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(game));
  }
}

export function useGameStorage(storageKey: string) {
  const [game, setGameRaw] = useState<GameState | null>(() =>
    loadGame(storageKey),
  );

  useEffect(() => {
    saveGame(storageKey, game);
  }, [game, storageKey]);

  function setGame(
    updater: GameState | null | ((prev: GameState | null) => GameState | null),
  ) {
    setGameRaw(updater);
  }

  function clearGame() {
    setGameRaw(null);
  }

  return { game, setGame, clearGame };
}

const USER_ID_KEY = 'blackcrown:online:userId';

export function loadOnlineUserId(): string | null {
  try {
    return localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}

export function saveOnlineUserId(id: string | null) {
  if (id === null) localStorage.removeItem(USER_ID_KEY);
  else localStorage.setItem(USER_ID_KEY, id);
}

// The id of the game that the persisted GameState belongs to. GameState itself
// carries no game identifier, so we store this separately to detect when the
// stored state is left over from a previous game and must be discarded.
const STATE_GAME_ID_KEY = 'blackcrown:online:gameId';

export function loadStateGameId(): string | null {
  try {
    return localStorage.getItem(STATE_GAME_ID_KEY);
  } catch {
    return null;
  }
}

export function saveStateGameId(id: string | null) {
  if (id === null) localStorage.removeItem(STATE_GAME_ID_KEY);
  else localStorage.setItem(STATE_GAME_ID_KEY, id);
}
