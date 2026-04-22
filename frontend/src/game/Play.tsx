import { useEffect, useState } from 'react';
import { ScrollablePage } from 'components/general/Scrollable';
import {
  PlayTableStyle,
  TableWrapper,
  PlayerCountStyle,
  Overlay,
  OverlayStyle,
  RecordTableStyle,
  ShowFinishedStyle,
} from 'game/GameTableStyle';
import { initialGame } from 'game/state/initialState';
import { dealInitialCards } from 'game/logic/deck';
import { hit, stand } from 'game/logic/game';
import { useGameCanvas } from 'game/canvas/useGameCanvas';
import type { GameState } from 'game/logic/types';
import { newRoundGame, nextPlayer } from 'game/engine/gameEngine';

type RoundRecord = {
  round: number;
  winnerId: number | null;
  scores: number[];
};

function Play() {
  const [started, setStarted] = useState(false);
  const [local, setLocal] = useState(false);
  const [online, setOnline] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [displayRecord, setDisplayRecord] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
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
      const g = initialGame(playerCount);
      return dealInitialCards(g);
    });
  }

  function handleStartOnlineGame(playerCount: number) {
    setStarted(true);
    setGame(() => {
      const g = initialGame(playerCount);
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
    // setShowFinished(false)
    setHistory((h) => [
      ...h,
      {
        round: game.turn,
        winnerId: game.winnerId,
        scores: game.players.map((p) => p.score),
      },
    ]);
    const playerCount = game.players.length;
    reset();
    const newGame = newRoundGame(playerCount, game);
    setGame(dealInitialCards(newGame));
  }

  function handleDisplayRecord() {
    if (!game) return;
    setHistory((h) => [
      ...h,
      {
        round: game.turn,
        winnerId: game.winnerId,
        scores: game.players.map((p) => p.score),
      },
    ]);
    setStarted(false);
    if (local) setLocal(false);
    if (online) setOnline(false);
    setDisplayRecord(true);
  }

  useEffect(() => {
    if (!game) return;
    if (game.gameStatus == 'transition') {
      const timer = setTimeout(() => {
        setShowTransition(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowTransition(false);
    }
  }, [game?.gameStatus]);

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
                    <button onClick={handleNextPlayer}>Confirm</button>
                  </>
                )}
              </Overlay>
            )}
            {game?.gameStatus === 'finished' && (
              <ShowFinishedStyle>
                <p>
                  Round {game.turn}: winner is player {game.winnerId! + 1}
                </p>
                <div className="btn">
                  <button onClick={handleNewRound}>Another turn</button>
                  <button onClick={handleDisplayRecord}>Stop playing</button>
                </div>
              </ShowFinishedStyle>
            )}
            <PlayTableStyle>
              <canvas ref={canvasRef} width={900} height={600}></canvas>
            </PlayTableStyle>
            <div className="btn">
              <button
                onClick={handleHit}
                disabled={game.gameStatus !== 'playing'}
              >
                Hit
              </button>
              <button
                onClick={handleStand}
                disabled={game.gameStatus !== 'playing'}
              >
                Stand
              </button>
            </div>
          </TableWrapper>
        </>
      )}
      {!local && !online && !displayRecord && (
        <div>
          <h1>Play</h1>
          <button onClick={handleLocalGame}>Local game</button>
          <button onClick={handleOnlineGame}>Online game</button>
        </div>
      )}
      {(local || online) && !started && (
        <PlayerCount
          local={local}
          onStartLocalGame={handleStartLocalGame}
          onStartOnlineGame={handleStartOnlineGame}
        />
      )}
      {!started && displayRecord && !local && !online && (
        <DisplayRecord game={game} history={history} />
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
      <button
        onClick={() => {
          local ? onStartLocalGame(2) : onStartOnlineGame(2);
        }}
      >
        1 v 1
      </button>
      <button
        onClick={() => {
          local ? onStartLocalGame(3) : onStartOnlineGame(3);
        }}
      >
        1 v 1 v 1
      </button>
      <button
        onClick={() => {
          local ? onStartLocalGame(4) : onStartOnlineGame(4);
        }}
      >
        1 v 1 v 1 v 1
      </button>
    </PlayerCountStyle>
  );
}

type DisplayRecordProps = {
  game: GameState | null;
  history: RoundRecord[];
};

function DisplayRecord({ game, history }: DisplayRecordProps) {
  if (!game) {
    return (
      <Overlay>
        <OverlayStyle>
          <h2>No records yet.</h2>
          <button onClick={() => window.location.reload()}>Back</button>
        </OverlayStyle>
      </Overlay>
    );
  }
  return (
    <Overlay>
      <RecordTableStyle>
        <thead>
          <tr>
            <th>Round</th>
            {game.players.map((p, i) => (
              <th key={i}>Player {p.id + 1}</th>
            ))}
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, idx) => (
            <tr key={idx}>
              <td>{h.round}</td>
              {h.scores.map((score, sIdx) => (
                <td key={sIdx}>
                  {game.players[sIdx].hasBlackCrown ? 'Black Crown' : score}
                </td>
              ))}
              <td>{h.winnerId! + 1}</td>
            </tr>
          ))}
        </tbody>
      </RecordTableStyle>
      <button onClick={() => window.location.reload()}>Back</button>
    </Overlay>
  );
}

export default Play;
