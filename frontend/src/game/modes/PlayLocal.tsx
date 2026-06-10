import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayTableStyle,
  TableWrapper,
  PlayerCountStyle,
  Overlay,
  ShowFinishedStyle,
} from 'game/GameTableStyle';
import { ScrollablePage } from 'components/general/Scrollable';
import CenterButtons from 'components/btn/CenterButtons';
import { BtnDefault } from 'components/btn/Btn';
import { initialGame } from 'game/state/initialState';
import { dealInitialCards } from 'game/logic/deck';
import { hit, stand } from 'game/logic/game';
import { useGameCanvas } from 'game/canvas/useGameCanvas';
import { newRoundGame, nextPlayer } from 'game/engine/gameEngine';
import { useGameStorage } from 'game/hooks/useGameStorage';

const STORAGE_KEY = 'blackjack:local';

export default function PlayLocal() {
  const navigate = useNavigate();
  const { game, setGame, clearGame } = useGameStorage(STORAGE_KEY);
  const [showTransition, setShowTransition] = useState<boolean>(false);

  // Derive started from game existence - no separate flag needed.
  // This means a refresh with a saved game goes straight back into play.
  const started = game !== null;

  // In local (hotseat) mode the "local player" rotates with the turn so that
  // the current player always sees their own real score and hidden card, while
  // everyone else only sees the visible-card estimate.
  const localPlayer = game?.currentPlayerIdx ?? 0;
  const { canvasRef, reset } = useGameCanvas(game, started, localPlayer, true);

  function handleStartGame(playerCount: number) {
    const g = initialGame(playerCount, '');
    setGame(dealInitialCards(g));
  }

  function handleHit() {
    setGame((g) => (g ? hit(g.currentPlayerIdx, g) : g));
  }

  function handleStand() {
    setGame((g) => (g ? stand(g) : g));
  }

  function getNextActivePlayer(): number {
    if (!game) return -1;
    const total = game.players.length;
    for (let i = 1; i <= total; i++) {
      const idx = (game.currentPlayerIdx + i) % total;
      const player = game.players[idx];
      if (!player.hasStood && !player.isBusted) return idx;
    }
    return -1;
  }

  function handleNextPlayer() {
    setGame((g) => {
      if (!g) return g;
      const next = nextPlayer(g);
      if (next.gameStatus === 'transition') next.gameStatus = 'playing';
      return next;
    });
  }

  function handleNewRound() {
    if (!game) return;
    reset();
    const newGame = newRoundGame(game, '');
    setGame(dealInitialCards(newGame));
  }

  function handleStopPlaying() {
    reset();
    clearGame();
    void navigate('/play');
  }

  useEffect(() => {
    if (!game) return;
    if (game.gameStatus === 'transition') {
      const timer = setTimeout(() => setShowTransition(true), 1500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setShowTransition(false), 0);
    return () => clearTimeout(timer);
  }, [game]);

  if (!started) {
    return (
      <ScrollablePage>
        <h1>Black Crown - Local Mode - Create game</h1>
        <PlayerCountStyle>
          {[2, 3, 4].map((n) => (
            <BtnDefault key={n} onClick={() => handleStartGame(n)}>
              {n} players
            </BtnDefault>
          ))}
        </PlayerCountStyle>
      </ScrollablePage>
    );
  }

  return (
    <ScrollablePage>
      {game && (
        <>
          <h1>Black Crown - Local Mode</h1>
          <CenterButtons>
            <BtnDefault onClick={handleStopPlaying}>End Game</BtnDefault>
          </CenterButtons>
          <TableWrapper>
            {showTransition && game.gameStatus === 'transition' && (
              <Overlay>
                {game.players[game.currentPlayerIdx].isBusted && (
                  <p>You're busted!</p>
                )}
                {game.players[game.currentPlayerIdx].hasStood && (
                  <p>You stood!</p>
                )}
                {getNextActivePlayer() !== -1 && (
                  <>
                    <p>Change to Player {getNextActivePlayer() + 1}</p>
                    <BtnDefault onClick={handleNextPlayer}>Confirm</BtnDefault>
                  </>
                )}
              </Overlay>
            )}
            <PlayTableStyle>
              {game.gameStatus === 'finished' && (
                <ShowFinishedStyle>
                  <p>
                    Round {game.turn}: Winner is player {game.winnerId! + 1}
                  </p>
                  <div className="btn">
                    <BtnDefault onClick={handleNewRound}>
                      Another Game
                    </BtnDefault>
                    <BtnDefault onClick={handleStopPlaying}>
                      Stop Playing
                    </BtnDefault>
                  </div>
                </ShowFinishedStyle>
              )}
              <canvas ref={canvasRef} width={900} height={600} />
            </PlayTableStyle>
            <div className="btn">
              <BtnDefault
                onClick={handleHit}
                disabled={game.gameStatus !== 'playing'}
              >
                Hit
              </BtnDefault>
              <BtnDefault
                onClick={handleStand}
                disabled={game.gameStatus !== 'playing'}
              >
                Stand
              </BtnDefault>
            </div>
          </TableWrapper>
        </>
      )}
    </ScrollablePage>
  );
}
