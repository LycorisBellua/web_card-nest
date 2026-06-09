import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'context/useUser';
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
import {
  useGameStorage,
  loadOnlineUserId,
  saveOnlineUserId,
} from 'game/hooks/useGameStorage';
import NotFound from 'pages/NotFound';

const STORAGE_KEY = 'blackjack:online';

/**
 * Online mode:
 *  - The logged-in user is always player 0.
 *  - Other players' second card (index 1) stays hidden during play; all cards
 *    are revealed once the round finishes.
 *  - Other players' real score is also hidden during play (hideOtherScores).
 *  - The full game state lives in localStorage so the client stays in sync
 *    even after navigation.  The server is not authoritative.
 *  - The local user's ID is stored alongside the game.  If a different user
 *    logs in (or the current user logs out), the session is cleared automatically.
 *
 * TODO: Replace the local game engine calls (hit/stand/etc.) with API calls
 *       once the backend is ready.  Keep the localStorage mirror so that
 *       page navigation doesn't lose state.
 */
export default function PlayOnline() {
  const navigate = useNavigate();
  const { user, isAuthLoading } = useUser();
  const { game, setGame, clearGame } = useGameStorage(STORAGE_KEY);
  const [showTransition, setShowTransition] = useState<boolean>(false);

  // Derive started from game existence — no separate flag needed.
  // This means a refresh with a saved game goes straight back into play.
  const started = game !== null;

  // Player 0 is always the local user in online mode.
  const LOCAL_PLAYER_IDX = 0;

  const { canvasRef, reset } = useGameCanvas(
    game,
    started,
    LOCAL_PLAYER_IDX,
    true, // hideOtherScores: only show real score for the local player during play
  );

  const accessAllowed = !!user && user.rank.toLowerCase() !== 'pending';

  // Defined early with useCallback so the effects below can list it as a dep
  // without causing stale-closure issues.
  const handleStopPlaying = useCallback(() => {
    reset();
    clearGame();
    saveOnlineUserId(null);
    void navigate('/play');
  }, [clearGame, navigate, reset]);

  // Sync username changes into the game state so that a mid-game rename is
  // reflected immediately without needing a new round.
  useEffect(() => {
    if (!user || !game) return;
    setGame((g) => {
      if (!g) return g;
      if (g.players[LOCAL_PLAYER_IDX]?.username === user.username) return g;
      const next = {
        ...g,
        players: g.players.map((p, i) =>
          i === LOCAL_PLAYER_IDX ? { ...p, username: user.username } : p,
        ),
      };
      return next;
    });
  }, [user?.username]); // eslint-disable-line react-hooks/exhaustive-deps -- game/setGame intentionally omitted to avoid infinite loop

  // Clear the session when the user logs out or a different user logs in.
  // We wait for auth to finish loading before acting — on a refresh, user is
  // briefly null while the context rehydrates, and we must not mistake that
  // for a real logout.
  useEffect(() => {
    if (!started || isAuthLoading) return;

    // No user at all → genuinely logged out.
    if (!user) {
      handleStopPlaying();
      return;
    }

    const storedId = loadOnlineUserId();
    if (storedId !== null && storedId !== user.id) {
      // A different user has taken over this browser — clear the previous
      // session before they see anything.
      handleStopPlaying();
    }
  }, [user, isAuthLoading, started, handleStopPlaying]);

  const username = user?.username ?? '';

  function handleStartGame(playerCount: number) {
    // TODO: Replace with API call to create a room/session.
    if (!user) return;
    saveOnlineUserId(user.id);
    const g = initialGame(playerCount, username);
    const dealt = dealInitialCards(g);
    setGame(dealt);
  }

  function handleHit() {
    // TODO: Replace with API call; apply returned state.
    setGame((g) => {
      if (!g) return g;
      return hit(g.currentPlayerIdx, g);
    });
  }

  function handleStand() {
    // TODO: Replace with API call; apply returned state.
    setGame((g) => {
      if (!g) return g;
      return stand(g);
    });
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
    // TODO: Replace with API call; apply returned state.
    const newGame = newRoundGame(game, username);
    setGame(dealInitialCards(newGame));
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

  if (isAuthLoading) return null;
  if (!accessAllowed) return <NotFound />;

  if (!started) {
    return (
      <ScrollablePage>
        <h1>Black Crown - Online Mode - Create game</h1>
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
          <h1>Black Crown - Online Mode</h1>
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
