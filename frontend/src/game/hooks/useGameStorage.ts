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

/**
 * Wraps a GameState in useState and mirrors every change to localStorage.
 *
 * @param storageKey  The localStorage key to use.
 */
export function useGameStorage(storageKey: string) {
  const [game, setGameRaw] = useState<GameState | null>(() =>
    loadGame(storageKey),
  );

  // Persist to localStorage on every change.
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

const USER_ID_KEY = 'blackjack:online:userId';

/**
 * Stores and retrieves the user ID that owns the current online game session.
 * Used to detect when a different user has taken over the browser so the
 * previous session can be cleared automatically.
 */
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
