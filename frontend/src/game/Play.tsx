import { useEffect, useState } from 'react';
import { useUser } from 'context/useUser';
import {
  PlayTableStyle,
  TableWrapper,
  PlayerCountStyle,
  Overlay,
  ShowFinishedStyle,
} from 'game/GameTableStyle';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';
import { initialGame } from 'game/state/initialState';
import { dealInitialCards } from 'game/logic/deck';
import { hit, stand } from 'game/logic/game';
import { useGameCanvas } from 'game/canvas/useGameCanvas';
import type { GameState } from 'game/logic/types';
import { newRoundGame, nextPlayer } from 'game/engine/gameEngine';

function PlayGame() {
  const { user } = useUser();
  const [username, setUsername] = useState<string>('');
  const [started, setStarted] = useState<boolean>(false);
  const [local, setLocal] = useState<boolean>(false);
  const [online, setOnline] = useState<boolean>(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const { canvasRef, reset } = useGameCanvas(game, started);

  function handleLocalGame() {
    setLocal(true);
  }

  function handleOnlineGame() {
    setOnline(true);
  }

  function handleStartLocalGame(playerCount: number) {
    setStarted(true);
    setGame(() => {
      const g = initialGame(playerCount, username);
      return dealInitialCards(g);
    });
  }

  function handleStartOnlineGame(playerCount: number) {
    setStarted(true);
    setGame(() => {
      const g = initialGame(playerCount, username);
      return dealInitialCards(g);
    });
  }

  function handleHit() {
    setGame((g) => {
      if (!g) return g;
      return hit(g.currentPlayerIdx, g);
    });
  }

  function handleStand() {
    setGame((g) => {
      if (!g) return g;
      const next = stand(g);
      return next;
    });
  }

  function getNextActivePlayer(): number {
    if (!game) return -1;
    const total = game.players.length;
    for (let i = 1; i <= total; i++) {
      const nextPlayer = (game.currentPlayerIdx + i) % total;
      const player = game.players[nextPlayer];
      if (!player.hasStood && !player.isBusted) {
        return nextPlayer;
      }
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
    const newGame = newRoundGame(game, username);
    setGame(dealInitialCards(newGame));
  }

  useEffect(() => {
    function updateUsername() {
      if (local || !user) setUsername('');
      else setUsername(user.username);
    }
    updateUsername();
  }, [local, user]);

  useEffect(() => {
    if (!game) return;
    if (game.gameStatus === 'transition') {
      const timer = setTimeout(() => {
        setShowTransition(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setShowTransition(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [game]);

  return (
    <ScrollablePage>
      {started && game && (
        <>
          <TableWrapper>
            {showTransition && game?.gameStatus === 'transition' && (
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
              {game?.gameStatus === 'finished' && (
                <ShowFinishedStyle>
                  <p>
                    Round {game.turn}: Winner is player {game.winnerId! + 1}
                  </p>
                  <div className="btn">
                    <BtnDefault onClick={handleNewRound}>
                      Another Game
                    </BtnDefault>
                    <BtnDefault onClick={() => window.location.reload()}>
                      Stop Playing
                    </BtnDefault>
                  </div>
                </ShowFinishedStyle>
              )}
              <canvas ref={canvasRef} width={900} height={600}></canvas>
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
      {!local && !online && (
        <div>
          <BtnDefault onClick={handleLocalGame}>Local game</BtnDefault>
          <BtnDefault onClick={handleOnlineGame}>Online game</BtnDefault>
        </div>
      )}
      {(local || online) && !started && (
        <PlayerCount
          local={local}
          onStartLocalGame={handleStartLocalGame}
          onStartOnlineGame={handleStartOnlineGame}
        />
      )}
    </ScrollablePage>
  );
}

type PlayerCountProps = {
  local: boolean;
  onStartLocalGame: (playerCount: number) => void;
  onStartOnlineGame: (playerCount: number) => void;
};

function PlayerCount({
  local,
  onStartLocalGame,
  onStartOnlineGame,
}: PlayerCountProps) {
  return (
    <PlayerCountStyle>
      <BtnDefault
        onClick={() => {
          if (local) onStartLocalGame(2);
          else onStartOnlineGame(2);
        }}
      >
        2 players
      </BtnDefault>
      <BtnDefault
        onClick={() => {
          if (local) onStartLocalGame(3);
          else onStartOnlineGame(3);
        }}
      >
        3 players
      </BtnDefault>
      <BtnDefault
        onClick={() => {
          if (local) onStartLocalGame(4);
          else onStartOnlineGame(4);
        }}
      >
        4 players
      </BtnDefault>
    </PlayerCountStyle>
  );
}

export default PlayGame;
