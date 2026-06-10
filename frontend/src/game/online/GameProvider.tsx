import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSocket } from 'context/useSocket';
import { useUser } from 'context/useUser';
import {
  useGameStorage,
  loadOnlineUserId,
  saveOnlineUserId,
  loadStateGameId,
  saveStateGameId,
} from 'game/hooks/useGameStorage';
import { initialGame } from 'game/state/initialState';
import { dealInitialCards } from 'game/logic/deck';
import { hit as engineHit, stand as engineStand } from 'game/logic/game';
import { nextPlayer, newRoundGame } from 'game/engine/gameEngine';
import type { GameInfo, RelayMessage } from 'game/online/types';
import type { GameState } from 'game/logic/types';
import { GameContext } from 'game/online/GameContext';
import type { GameContextType } from 'game/online/GameContext';

const STORAGE_KEY = 'blackcrown:online';
const BOT_DELAY_MS = 2000;

function settle(next: GameState): GameState {
  if (next.gameStatus === 'transition') {
    next = nextPlayer(next);
    if (next.gameStatus === 'transition') next.gameStatus = 'playing';
  }
  return next;
}

function playableSeat(
  cur: GameState | null,
  inf: GameInfo | null,
  uid?: string,
): number {
  if (!cur || !inf || !uid) return -1;
  const seat = inf.players.findIndex((p) => p.type === 'human' && p.id === uid);
  if (cur.gameStatus !== 'playing' || cur.currentPlayerIdx !== seat) return -1;
  return seat;
}

function refreshedNames(
  players: GameState['players'],
  leaderSeat: number,
  leaderName: string,
): GameState['players'] {
  return players.map((p, i) => ({
    ...p,
    username: i === leaderSeat ? leaderName : null,
  }));
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const { user, isAuthLoading } = useUser();
  const { game: state, setGame: setState } = useGameStorage(STORAGE_KEY);

  const [info, setInfo] = useState<GameInfo | null>(null);
  const [invite, setInvite] = useState<{ gameId: string } | null>(null);
  const [lastRejectedId, setLastRejectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seqRef = useRef<number>(-1);

  const liveRef = useRef(false);

  // Tracks which game the persisted GameState belongs to, so we can recognise
  // and drop state left over from a previous game (e.g. after a timeout).
  const stateGameIdRef = useRef<string | null>(loadStateGameId());

  const localSeat = useMemo(() => {
    if (!info || !user) return -1;
    return info.players.findIndex(
      (p) => p.type === 'human' && p.id === user.id,
    );
  }, [info, user]);

  const isLeader = !!user && info?.leader === user.id;
  const isInGame = info !== null;
  const isMyTurn =
    !!state &&
    state.gameStatus === 'playing' &&
    localSeat >= 0 &&
    state.currentPlayerIdx === localSeat;

  const pendingInvites = useMemo(() => {
    if (!info || !Array.isArray(info.invited)) return [];
    return info.invited.filter(
      (inv) => !info.players.some((p) => p.type === 'human' && p.id === inv.id),
    );
  }, [info]);

  const ref = useRef({ info, state, user, isLeader, isAuthLoading });
  const setStateRef = useRef(setState);
  useEffect(() => {
    ref.current = { info, state, user, isLeader, isAuthLoading };
    setStateRef.current = setState;
  });

  const emitState = useCallback(
    (game: GameState, seq: number) => {
      socket.emit('SyncGame', { kind: 'state', seq, game });
    },
    [socket],
  );

  const bumpSeq = useCallback(() => {
    seqRef.current = Math.max(Date.now(), seqRef.current + 1);
    return seqRef.current;
  }, []);

  // Single funnel for persisting game state. Stamps the owning game id
  // alongside the state (or clears both), keeping localStorage and the in-memory
  // tracking ref in sync so stale state can later be detected and dropped.
  const writeState = useCallback((game: GameState | null) => {
    setStateRef.current(game);
    if (game === null) {
      stateGameIdRef.current = null;
      saveStateGameId(null);
      return;
    }
    const gid = ref.current.info?.gameId ?? stateGameIdRef.current;
    stateGameIdRef.current = gid ?? null;
    saveStateGameId(gid ?? null);
  }, []);

  const clearLocalState = useCallback(() => {
    writeState(null);
    seqRef.current = -1;
    liveRef.current = false;
  }, [writeState]);

  const pushState = useCallback(
    (game: GameState) => {
      const seq = bumpSeq();
      liveRef.current = true;
      writeState(game);
      emitState(game, seq);
    },
    [emitState, bumpSeq, writeState],
  );

  const resetLocal = useCallback(() => {
    writeState(null);
    setInfo(null);
    setInvite(null);
    setLastRejectedId(null);
    seqRef.current = -1;
    liveRef.current = false;
  }, [writeState]);

  useEffect(() => {
    const onConnect = () => {
      liveRef.current = false;
      if (ref.current.isAuthLoading) return;
      const u = ref.current.user;
      const owner = loadOnlineUserId();
      if (!u) {
        if (owner !== null) resetLocal();
        return;
      }
      if (owner !== null && owner !== u.id) resetLocal();
      saveOnlineUserId(u.id);
    };

    const onInfo = (data: GameInfo) => {
      setError(null);
      // If our persisted state belongs to a different game than the one the
      // server now reports us in, it is stale (e.g. we timed out of the old
      // game and just created/joined a new one). Drop it from both memory and
      // localStorage before adopting the new game's info.
      if (
        stateGameIdRef.current !== null &&
        stateGameIdRef.current !== data.gameId
      ) {
        clearLocalState();
      }
      setInfo(data);
      const u = ref.current.user;
      const mine = data.players.some(
        (p) => p.type === 'human' && p.id === u?.id,
      );
      if (
        data.humans <= 1 &&
        mine &&
        ref.current.state &&
        stateGameIdRef.current === data.gameId
      ) {
        liveRef.current = true;
      }
    };

    const onRelay = (msg: RelayMessage) => {
      if (msg.kind === 'state') {
        if (msg.seq > seqRef.current) {
          seqRef.current = msg.seq;
          liveRef.current = true;
          writeState(msg.game);
        }
        return;
      }
      const { isLeader: leader, state: cur } = ref.current;
      if (!leader || !cur) return;
      if (msg.seat < 0 || msg.seat >= cur.players.length) return;
      if (cur.players[msg.seat].username === msg.username) return;
      pushState({
        ...cur,
        players: cur.players.map((p, i) =>
          i === msg.seat ? { ...p, username: msg.username } : p,
        ),
      });
    };

    const onInvite = (gameId: string) => {
      // Never surface an invite to a game we are already in (the backend now
      // blocks this, but guard the UI too so a self-invite can never appear).
      if (ref.current.info?.gameId === gameId) return;
      setInvite({ gameId });
    };
    const onCancelled = (gameId: string) =>
      setInvite((prev) => (prev && prev.gameId === gameId ? null : prev));
    const onRejected = (data: { gameId: string; invitedId: string }) =>
      setLastRejectedId(data.invitedId);
    const onError = (message: string) => setError(message);

    socket.on('connect', onConnect);
    socket.on('GameInfo', onInfo);
    socket.on('GameState', onRelay);
    socket.on('GameInvite', onInvite);
    socket.on('GameInviteCancelled', onCancelled);
    socket.on('GameRejected', onRejected);
    socket.on('GameError', onError);
    return () => {
      socket.off('connect', onConnect);
      socket.off('GameInfo', onInfo);
      socket.off('GameState', onRelay);
      socket.off('GameInvite', onInvite);
      socket.off('GameInviteCancelled', onCancelled);
      socket.off('GameRejected', onRejected);
      socket.off('GameError', onError);
    };
  }, [socket, pushState, resetLocal, writeState, clearLocalState]);

  useEffect(() => {
    if (!liveRef.current || !ref.current.state) return;
    emitState(ref.current.state, bumpSeq());
  }, [info, emitState, bumpSeq]);

  useEffect(() => {
    if (!isLeader || !state || !info || !liveRef.current) return;
    if (state.gameStatus !== 'playing') return;
    const occ = info.players[state.currentPlayerIdx];
    if (!occ || occ.type !== 'bot') return;

    const id = setTimeout(() => {
      if (!ref.current.isLeader || !liveRef.current) return;
      const cur = ref.current.state;
      const inf = ref.current.info;
      if (!cur || !inf) return;
      if (cur.gameStatus !== 'playing') return;
      const o = inf.players[cur.currentPlayerIdx];
      if (!o || o.type !== 'bot') return;
      const seat = cur.players[cur.currentPlayerIdx];
      const played =
        seat.score < 17
          ? engineHit(cur.currentPlayerIdx, cur)
          : engineStand(cur);
      pushState(settle(played));
    }, BOT_DELAY_MS);
    return () => clearTimeout(id);
  }, [isLeader, state, info, pushState]);

  useEffect(() => {
    if (isLeader || !user || localSeat < 0 || !state) return;
    if (state.players[localSeat]?.username === user.username) return;
    socket.emit('SyncGame', {
      kind: 'identify',
      seat: localSeat,
      username: user.username,
    });
  }, [isLeader, user, localSeat, state, socket]);

  const createGame = useCallback(
    (seats: number) => {
      if (!user) return;
      socket.emit('CreateGame', { seats });
    },
    [socket, user],
  );

  const inviteUser = useCallback(
    (username: string) => {
      const inf = ref.current.info;
      if (!inf) return;
      socket.emit('InviteGame', { gameId: inf.gameId, username });
    },
    [socket],
  );

  const cancelInvite = useCallback(
    (invitedId: string) => {
      const inf = ref.current.info;
      if (!inf) return;
      socket.emit('CancelInvite', { gameId: inf.gameId, invitedId });
    },
    [socket],
  );

  const acceptInvite = useCallback(() => {
    if (!invite || !user) return;
    socket.emit('JoinGame', { gameId: invite.gameId });
    setInvite(null);
  }, [socket, invite, user]);

  const rejectInvite = useCallback(() => {
    if (!invite) return;
    socket.emit('RejectGame', { gameId: invite.gameId });
    setInvite(null);
  }, [socket, invite]);

  const startGame = useCallback(() => {
    const inf = ref.current.info;
    const u = ref.current.user;
    if (!inf || !u || inf.leader !== u.id) return;
    const seat = inf.players.findIndex(
      (p) => p.type === 'human' && p.id === u.id,
    );
    const g = initialGame(inf.seats, '');
    pushState(
      dealInitialCards({
        ...g,
        players: refreshedNames(g.players, seat, u.username),
      }),
    );
  }, [pushState]);

  const leaveGame = useCallback(() => {
    socket.emit('LeaveGame');
    resetLocal();
  }, [socket, resetLocal]);

  const hit = useCallback(() => {
    if (!liveRef.current) return;
    const { state: cur, info: inf, user: u } = ref.current;
    if (playableSeat(cur, inf, u?.id) < 0 || !cur) return;
    pushState(settle(engineHit(cur.currentPlayerIdx, cur)));
  }, [pushState]);

  const stand = useCallback(() => {
    if (!liveRef.current) return;
    const { state: cur, info: inf, user: u } = ref.current;
    if (playableSeat(cur, inf, u?.id) < 0 || !cur) return;
    pushState(settle(engineStand(cur)));
  }, [pushState]);

  const newRound = useCallback(() => {
    const { state: cur, user: u, isLeader: leader } = ref.current;
    if (!cur || !u || !leader) return;
    const inf = ref.current.info;
    const seat = inf
      ? inf.players.findIndex((p) => p.type === 'human' && p.id === u.id)
      : -1;
    const rebuilt = newRoundGame(cur, '');
    pushState(
      dealInitialCards({
        ...rebuilt,
        players: refreshedNames(rebuilt.players, seat, u.username),
      }),
    );
  }, [pushState]);

  const clearError = useCallback(() => setError(null), []);

  const value: GameContextType = {
    info,
    state,
    invite,
    pendingInvites,
    lastRejectedId,
    error,
    localSeat,
    isLeader,
    isInGame,
    isMyTurn,
    createGame,
    inviteUser,
    cancelInvite,
    acceptInvite,
    rejectInvite,
    startGame,
    leaveGame,
    hit,
    stand,
    newRound,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
