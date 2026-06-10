import { useContext } from 'react';
import { GameContext } from 'game/online/GameContext';

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
