import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { useSocket } from 'context/useSocket';
import { useGame } from 'game/online/useGame';
import {
  PlayTableStyle,
  TableWrapper,
  PlayerCountStyle,
  ShowFinishedStyle,
} from 'game/GameTableStyle';
import { ScrollablePage } from 'components/general/Scrollable';
import CenterButtons from 'components/btn/CenterButtons';
import { BtnDefault } from 'components/btn/Btn';
import { useGameCanvas } from 'game/canvas/useGameCanvas';
import type { GameState } from 'game/logic/types';
import type { Timeout } from 'game/online/types';
import NotFound from 'pages/NotFound';

/**
 * Online mode, wired to the GameProvider.
 *  - Lobby/occupancy and leadership come from the server (`info`).
 *  - Gameplay (`state`) is relayed peer-to-peer; this component only renders it
 *    and calls hit/stand, which the provider ignores unless it is our turn —
 *    the disabled buttons here are just the matching UI layer.
 *  - The local user's seat comes from `localSeat`, no longer hardcoded to 0.
 *  - There is no "pass the device" transition: the provider auto-advances turns,
 *    so the only states reaching the canvas are 'playing' and 'finished'.
 */
export default function PlayOnline() {
  const navigate = useNavigate();
  const { user, isAuthLoading } = useUser();
  const { onlineUsers } = useSocket();
  const {
    info,
    state,
    isInGame,
    isLeader,
    localSeat,
    isMyTurn,
    pendingInvites,
    error,
    createGame,
    inviteUser,
    startGame,
    leaveGame,
    hit,
    stand,
    newRound,
    clearError,
  } = useGame();

  const [inviteId, setInviteId] = useState('');

  // Hooks must run unconditionally, so the canvas hook is called before any
  // early return. localSeat decides whose cards/score are revealed.
  const started = state !== null;
  const { canvasRef } = useGameCanvas(state, started, localSeat, true);

  const accessAllowed = !!user && user.rank.toLowerCase() !== 'pending';

  const handleLeave = () => {
    leaveGame();
    void navigate('/play');
  };

  const handleInvite = () => {
    const id = inviteId.trim();
    if (!id) return;
    inviteUser(id);
    setInviteId('');
  };

  if (isAuthLoading) return null;
  if (!accessAllowed) return <NotFound />;

  // ---- 1. Not in a game: choose a size and create one ----
  if (!isInGame) {
    return (
      <ScrollablePage>
        <h1>Black Crown - Online Mode - Create game</h1>
        {error && <ErrorLine message={error} onDismiss={clearError} />}
        <PlayerCountStyle>
          {[2, 3, 4].map((n) => (
            <BtnDefault key={n} onClick={() => createGame(n)}>
              {n} players
            </BtnDefault>
          ))}
        </PlayerCountStyle>
      </ScrollablePage>
    );
  }

  // ---- 2. In a game but not yet dealt: lobby ----
  if (!started) {
    return (
      <ScrollablePage>
        <h1>Black Crown - Online Mode - Lobby</h1>
        {error && <ErrorLine message={error} onDismiss={clearError} />}
        {info!.timeouts.length > 0 && (
          <ReconnectBanner
            timeouts={info!.timeouts}
            label={(seat) => `Player ${seat + 1}`}
          />
        )}

        <h2>Seats</h2>
        <ul>
          {info!.players.map((occ, seat) => {
            const isSelf = occ.type === 'human' && occ.id === user.id;
            const isSeatLeader =
              occ.type === 'human' && occ.id === info!.leader;
            const who =
              occ.type === 'bot' ? 'open (bot)' : isSelf ? 'You' : occ.id;
            return (
              <li key={seat}>
                Seat {seat + 1}: {who}
                {isSeatLeader ? ' — leader' : ''}
              </li>
            );
          })}
        </ul>

        {isLeader && (
          <>
            <h2>Invite a player</h2>
            <input
              type="text"
              value={inviteId}
              placeholder="user id"
              onChange={(e) => setInviteId(e.target.value)}
            />
            <BtnDefault onClick={handleInvite}>Invite</BtnDefault>
            {pendingInvites.length > 0 && (
              <ul>
                {pendingInvites.map((id) => (
                  <li key={id}>
                    {id} — {onlineUsers.has(id) ? 'pending' : 'offline'}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <CenterButtons>
          {isLeader ? (
            <BtnDefault onClick={startGame}>Start game</BtnDefault>
          ) : (
            <p>Waiting for the leader to start…</p>
          )}
          <BtnDefault onClick={handleLeave}>End Game</BtnDefault>
        </CenterButtons>
      </ScrollablePage>
    );
  }

  // ---- 3. Playing ----
  return (
    <ScrollablePage>
      <h1>Black Crown - Online Mode</h1>
      {error && <ErrorLine message={error} onDismiss={clearError} />}
      <CenterButtons>
        <BtnDefault onClick={handleLeave}>End Game</BtnDefault>
      </CenterButtons>
      {info && info.timeouts.length > 0 && (
        <ReconnectBanner
          timeouts={info.timeouts}
          label={(seat) =>
            state.players[seat]?.username ?? `Player ${seat + 1}`
          }
        />
      )}
      <TableWrapper>
        <PlayTableStyle>
          {state.gameStatus === 'finished' && (
            <ShowFinishedStyle>
              <p>{winnerText(state)}</p>
              <div className="btn">
                {isLeader ? (
                  <BtnDefault onClick={newRound}>Another Game</BtnDefault>
                ) : (
                  <p>Waiting for the leader to start a new round…</p>
                )}
                <BtnDefault onClick={handleLeave}>Stop Playing</BtnDefault>
              </div>
            </ShowFinishedStyle>
          )}
          <canvas ref={canvasRef} width={900} height={600} />
        </PlayTableStyle>
        <div className="btn">
          <BtnDefault onClick={hit} disabled={!isMyTurn}>
            Hit
          </BtnDefault>
          <BtnDefault onClick={stand} disabled={!isMyTurn}>
            Stand
          </BtnDefault>
        </div>
      </TableWrapper>
    </ScrollablePage>
  );
}

function winnerText(g: GameState): string {
  if (g.winnerId == null || g.winnerId < 0) {
    return `Round ${g.turn}: no winner`;
  }
  const name = g.players[g.winnerId]?.username ?? `Player ${g.winnerId + 1}`;
  return `Round ${g.turn}: winner is ${name}`;
}

/**
 * Shows a live countdown for each seat whose player has disconnected, using the
 * absolute `timer` deadline from the server. Ticks once a second and self-clears
 * each entry the moment it expires, so it stays correct even though the server
 * does not push an update when a 30s window lapses.
 */
function ReconnectBanner({
  timeouts,
  label,
}: {
  timeouts: Timeout[];
  label: (seat: number) => string;
}) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const raf = requestAnimationFrame(tick); // first paint, ~immediate
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  if (now === 0) return null; // first frame before the clock is set
  const active = timeouts.filter((t) => t.timer > now);
  if (active.length === 0) return null;

  return (
    <div style={{ color: '#FFD700', textAlign: 'center' }}>
      {active.map((t) => (
        <p key={t.seat}>
          {label(t.seat)} disconnected — {Math.ceil((t.timer - now) / 1000)}s to
          return (playing as a bot)
        </p>
      ))}
    </div>
  );
}

function ErrorLine({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <p style={{ color: '#c0110f' }}>
      {message}{' '}
      <button onClick={onDismiss} style={{ marginLeft: 8 }}>
        dismiss
      </button>
    </p>
  );
}
