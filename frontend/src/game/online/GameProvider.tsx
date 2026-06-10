import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSocket } from 'context/useSocket';
import { useUser } from 'context/useUser';
import {
  useGameStorage,
  loadOnlineUserId,
  saveOnlineUserId,
} from 'game/hooks/useGameStorage';
import { initialGame } from 'game/state/initialState';
import { dealInitialCards } from 'game/logic/deck';
import { hit as engineHit, stand as engineStand } from 'game/logic/game';
import { nextPlayer, newRoundGame } from 'game/engine/gameEngine';
import type { GameInfo, RelayMessage } from 'game/online/types';
import type { GameState } from 'game/logic/types';
import { GameContext } from 'game/online/GameContext';
import type { GameContextType } from 'game/online/GameContext';

const STORAGE_KEY = 'blackjack:online';
const BOT_DELAY_MS = 2000;

/**
 * After a hit/stand the engine parks the game in 'transition' (the hotseat
 * "pass the device" pause). Online has no device to pass, so we advance to the
 * next active player immediately and resume play.
 */
function settle(next: GameState): GameState {
  if (next.gameStatus === 'transition') {
    next = nextPlayer(next);
    if (next.gameStatus === 'transition') next.gameStatus = 'playing';
  }
  return next;
}

/**
 * Returns the user's seat if it is currently their turn to act, else -1.
 * Pure (all inputs passed in) so it can live at module scope.
 */
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

/**
 * Reset every seat's display name at the start of a round: the leader stamps
 * its own current username; every other seat is cleared to null. Cleared human
 * seats re-announce via `identify` (so renames are picked up), and a seat now
 * held by a bot (a player who left) drops the departed name and falls back to
 * the canvas's generic "#N Player" label.
 */
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

/**
 * Owns everything about the online game: the server's lobby/occupancy snapshot
 * (`GameInfo`), the relayed gameplay (`GameState`, persisted to localStorage),
 * and incoming/outgoing invites. Mount it inside SocketProvider and
 * UserProvider so it shares the authenticated socket.
 *
 * Authority model (turn-holder):
 *  - The human whose seat is current runs their own hit/stand and broadcasts
 *    the resulting snapshot. A client literally cannot mutate state off-turn,
 *    so "no acting off-turn" is enforced at the data layer, not just the UI.
 *  - The leader is the authority for everything with no human turn-holder:
 *    the initial deal, new rounds, and any seat the server marks as a bot
 *    (disconnected players included). Leadership = authority, and the server
 *    moves leadership on disconnect, so authority follows it automatically.
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const { user, isAuthLoading } = useUser();
  const { game: state, setGame: setState } = useGameStorage(STORAGE_KEY);

  const [info, setInfo] = useState<GameInfo | null>(null);
  const [invite, setInvite] = useState<{ gameId: string } | null>(null);
  const [lastRejectedId, setLastRejectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Monotonic ordering of relayed snapshots, timestamp-based (see bumpSeq), so
  // it stays ahead of prior values across a refresh without being persisted.
  const seqRef = useRef<number>(-1);

  // Whether our current snapshot is "live" — adopted from a relay or pushed by
  // us this session — rather than merely rehydrated from localStorage on a
  // (re)connect and possibly stale. We refuse to act on or re-broadcast non-live
  // state, so a reconnecting client (the leader included) can never clobber the
  // table with an outdated snapshot.
  const liveRef = useRef(false);

  // ----- derived -----
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
      (id) => !info.players.some((p) => p.type === 'human' && p.id === id),
    );
  }, [info]);

  // Latest values for the stable socket handlers / timers to read without
  // re-subscribing on every render (mirrors the ref pattern in useGameCanvas).
  const ref = useRef({ info, state, user, isLeader, isAuthLoading });
  const setStateRef = useRef(setState);
  // Updated after commit (never during render) so we don't write refs while
  // rendering. Handlers fire asynchronously, well after this has run.
  useEffect(() => {
    ref.current = { info, state, user, isLeader, isAuthLoading };
    setStateRef.current = setState;
  });

  // ----- relay helpers -----
  const emitState = useCallback(
    (game: GameState, seq: number) => {
      socket.emit('SyncGame', { kind: 'state', seq, game });
    },
    [socket],
  );

  // Strictly-increasing, timestamp-based sequence. Date.now() keeps it ahead of
  // any pre-refresh value (so a reloaded client's broadcasts are accepted
  // again); the +1 term guarantees strict increase even within one millisecond
  // and regardless of clock skew between players.
  const bumpSeq = useCallback(() => {
    seqRef.current = Math.max(Date.now(), seqRef.current + 1);
    return seqRef.current;
  }, []);

  // Apply locally (persist) and broadcast as the new authoritative snapshot.
  const pushState = useCallback(
    (game: GameState) => {
      const seq = bumpSeq();
      liveRef.current = true;
      setStateRef.current(game);
      emitState(game, seq);
    },
    [emitState, bumpSeq],
  );

  const resetLocal = useCallback(() => {
    setStateRef.current(null);
    setInfo(null);
    setInvite(null);
    setLastRejectedId(null);
    seqRef.current = -1;
    liveRef.current = false;
  }, []);

  // ----- socket subscriptions (mounted once) -----
  useEffect(() => {
    const onConnect = () => {
      // After any (re)connect we may have missed relays, so treat our snapshot
      // as stale until a fresh one arrives (or onInfo finds we're the sole
      // human, in which case our cache is authoritative).
      liveRef.current = false;

      // Reconcile session ownership. We wait for auth to settle so the brief
      // guest connect during loading isn't mistaken for a logout. Same user
      // reconnecting (a transient drop) keeps the game; a different user (or a
      // logout) clears the leftover session. Running here — a subscription
      // callback rather than an effect body — also avoids a synchronous
      // setState cascade during render/effects.
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
      setInfo(data);
      const u = ref.current.user;
      const mine = data.players.some(
        (p) => p.type === 'human' && p.id === u?.id,
      );
      // Sole human: nobody else could have advanced the game while we were
      // away, so our rehydrated snapshot is authoritative — trust it as live.
      if (data.humans <= 1 && mine && ref.current.state) {
        liveRef.current = true;
      }
    };

    const onRelay = (msg: RelayMessage) => {
      if (msg.kind === 'state') {
        if (msg.seq > seqRef.current) {
          seqRef.current = msg.seq;
          liveRef.current = true;
          setStateRef.current(msg.game);
        }
        return;
      }
      // 'identify': only the leader bakes names into the canonical snapshot.
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

    const onInvite = (gameId: string) => setInvite({ gameId });
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
  }, [socket, pushState, resetLocal]);

  // Whenever occupancy changes, any client holding live state re-broadcasts it
  // at a fresh seq so reconnecting/late-joining clients (whose state is stale or
  // missing) re-sync. Live clients hold identical state, so redundant echoes are
  // harmless; a non-live client stays silent and cannot clobber the table.
  useEffect(() => {
    if (!liveRef.current || !ref.current.state) return;
    emitState(ref.current.state, bumpSeq());
  }, [info, emitState, bumpSeq]);

  // Leader drives any seat the server marks as a bot (incl. disconnected
  // players): hit while under 17, otherwise stand. Re-runs after each move, so
  // consecutive bot turns chain until a human's turn or the round ends.
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

  // Non-leaders announce their name once it is missing from the snapshot. The
  // leader bakes its own name in at startGame/newRound, so it skips this.
  useEffect(() => {
    if (isLeader || !user || localSeat < 0 || !state) return;
    if (state.players[localSeat]?.username === user.username) return;
    socket.emit('SyncGame', {
      kind: 'identify',
      seat: localSeat,
      username: user.username,
    });
  }, [isLeader, user, localSeat, state, socket]);

  // ----- lobby actions -----
  const createGame = useCallback(
    (seats: number) => {
      if (!user) return;
      socket.emit('CreateGame', { seats });
    },
    [socket, user],
  );

  const inviteUser = useCallback(
    (invitedId: string) => {
      const inf = ref.current.info;
      if (!inf) return;
      socket.emit('InviteGame', { gameId: inf.gameId, invitedId });
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

  // ----- gameplay actions -----
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
