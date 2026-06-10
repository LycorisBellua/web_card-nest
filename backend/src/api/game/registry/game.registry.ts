import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { v7 } from 'uuid';
import { Timeout, type Game, type Occupant } from '../types/game.types';
import { GameErr } from '../errors/game.errors';
import { CreateGameDto } from '../dto/creategame.dto';
import { JoinGameDto } from '../dto/joingame.dto';
import { LeaveGameDto } from '../dto/leavegame.dto';
import { InviteGameDto } from '../dto/invitegame.dto';

@Injectable()
export class GameRegistry implements OnModuleDestroy {
  private gameId_game = new Map<string, Game>();
  private userId_gameId = new Map<string, string>();
  private readonly sweepInterval: ReturnType<typeof setInterval>;

  constructor() {
    // The registry is otherwise lazy - it only cleans up when poked by an
    // action (create/join/leave/reconnect). Without this sweep, a game where
    // everyone disconnected at once would linger in memory forever, since no
    // action ever runs to notice the reconnect windows have all lapsed.
    this.sweepInterval = setInterval(() => this.sweep(), 10_000);
    // Don't keep the Node event loop alive just for the sweep.
    this.sweepInterval.unref?.();
  }

  onModuleDestroy(): void {
    clearInterval(this.sweepInterval);
  }

  // Reap abandoned games: expire stale reconnect windows, then delete any game
  // with no humans present and no live windows remaining. Deleting the current
  // key while iterating a Map is safe.
  private sweep(): void {
    for (const [gameId, game] of this.gameId_game) {
      this.gameTimeoutsCleanup(game);
      if (game.humans === 0 && game.timeouts.length === 0) {
        this.gameId_game.delete(gameId);
      }
    }
  }

  createGame(dto: CreateGameDto): Game {
    const seats = dto.seats;
    const userId = dto.userId;
    if (seats < 1 || seats > 4) {
      throw new BadRequestException(GameErr.SEATS);
    }
    this.userTimeoutCleanup(userId);
    if (this.getGameId(userId)) {
      throw new ForbiddenException(GameErr.ALREADY_IN_GAME);
    }
    const game = this.newGame(seats);
    game.players.push(this.newPlayer(userId));
    game.leader = userId;
    game.humans++;
    for (let i = 1; i < seats; i++) {
      game.players.push(this.newBot());
    }
    this.gameId_game.set(game.gameId, game);
    this.userId_gameId.set(userId, game.gameId);
    return game;
  }

  joinGame(dto: JoinGameDto): Game {
    const joinerId = dto.joinerId;
    const gameId = dto.gameId;
    this.userTimeoutCleanup(joinerId);
    if (this.getGameId(joinerId)) {
      throw new ForbiddenException(GameErr.ALREADY_IN_GAME);
    }
    const game = this.getGame(gameId);
    if (!game) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    if (!game.invited.has(joinerId)) {
      throw new ForbiddenException(GameErr.NOT_INVITED);
    }
    if (game.humans === game.seats) {
      throw new ForbiddenException(GameErr.NO_SEAT_AVAILABLE);
    }
    this.convertBotToNewPlayer(joinerId, game);
    this.userId_gameId.set(joinerId, gameId);
    return game;
  }

  leaveGame(dto: LeaveGameDto): Game {
    const userId = dto.userId;
    const gameId = this.getGameId(userId);
    if (!gameId) {
      throw new NotFoundException(GameErr.NOT_IN_GAME);
    }
    this.userId_gameId.delete(userId);
    const game = this.getGame(gameId);
    if (!game) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    this.convertPlayerToBot(userId, game, false);
    this.gameTimeoutsCleanup(game);
    if (game.leader === userId) {
      this.updateLeader(game);
    }
    if (game.humans === 0 && game.timeouts.length === 0) {
      this.gameId_game.delete(gameId);
    }
    return game;
  }

  disconnect(userId: string): Game | null {
    const gameId = this.getGameId(userId);
    if (!gameId) {
      return null;
    }
    const game = this.getGame(gameId);
    if (!game) {
      return null;
    }
    this.convertPlayerToBot(userId, game, true);
    if (game.leader === userId) {
      this.updateLeader(game);
    }
    return game;
  }

  reconnect(userId: string): Game {
    const gameId = this.getGameId(userId);
    if (!gameId) {
      throw new NotFoundException(GameErr.NOT_IN_GAME);
    }
    const game = this.getGame(gameId);
    if (!game) {
      this.userId_gameId.delete(userId);
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    if (game.players.some((p) => p.type === 'human' && p.id === userId)) {
      return game;
    }
    if (!this.convertBotToReturningPlayer(userId, game)) {
      this.userId_gameId.delete(userId);
      if (game.humans === 0 && game.timeouts.length === 0) {
        this.gameId_game.delete(gameId);
      }
      throw new ForbiddenException(GameErr.TIMED_OUT);
    }
    if (!game.players.some((p) => p.type === 'human' && p.id === game.leader)) {
      this.updateLeader(game);
    }
    return game;
  }

  inviteToGame(arg: {
    leaderId: string;
    gameId: string;
    invitedId: string;
    invitedUsername: string;
  }): Game {
    const game = this.getGame(arg.gameId);
    if (!game || arg.leaderId !== game.leader) {
      throw new ForbiddenException(GameErr.ONLY_LEADER_INVITE);
    }
    if (game.humans === game.seats) {
      throw new BadRequestException(GameErr.NO_SEAT_AVAILABLE);
    }
    game.invited.set(arg.invitedId, arg.invitedUsername);
    return game;
  }

  rejectInvite(dto: JoinGameDto): Game {
    const joinerId = dto.joinerId;
    const gameId = dto.gameId;
    const game = this.getGame(gameId);
    if (!game) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    if (!game.invited.has(joinerId)) {
      throw new BadRequestException(GameErr.NOT_INVITED);
    }
    game.invited.delete(joinerId);
    return game;
  }

  cancelInvite(dto: InviteGameDto): Game {
    const game = this.getGame(dto.gameId);
    if (!game || dto.leaderId !== game.leader) {
      throw new ForbiddenException(GameErr.ONLY_LEADER_INVITE);
    }
    game.invited.delete(dto.invitedId);
    return game;
  }

  // Games this user has a pending (un-acted) invite to. Used to re-deliver the
  // invite on (re)connect, since the prompt lives only in client memory.
  findInvites(userId: string): string[] {
    const gameIds: string[] = [];
    for (const [gameId, game] of this.gameId_game) {
      if (game.invited.has(userId)) {
        gameIds.push(gameId);
      }
    }
    return gameIds;
  }

  syncGameState(userId: string): Occupant[] {
    const gameId = this.getGameId(userId);
    if (!gameId) {
      throw new NotFoundException(GameErr.NOT_IN_GAME);
    }
    const game = this.getGame(gameId);
    if (!game || !game.players.find((p) => p.id === userId)) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    return game.players;
  }

  private getGameId(userId: string): string | undefined {
    return this.userId_gameId.get(userId);
  }

  private getGame(gameId: string): Game | undefined {
    return this.gameId_game.get(gameId);
  }

  private updateLeader(game: Game): void {
    const i = game.players.findIndex((p) => p.type === 'human');
    if (i === -1) {
      return;
    }
    game.leader = game.players[i].id;
  }

  private convertPlayerToBot(userId: string, game: Game, timeout: boolean) {
    const i = game.players.findIndex((p) => p.id === userId);
    if (i === -1) {
      return;
    }
    if (timeout) {
      const existingLeaderTimeout = game.timeouts.some(
        (t) => t.leader === true,
      );
      game.timeouts.push({
        occupant: game.players[i],
        timer: Date.now() + 30000,
        seat: i,
        leader: !existingLeaderTimeout && game.leader === userId,
      });
    }
    game.players[i] = this.newBot();
    game.humans--;
  }

  private convertBotToNewPlayer(userId: string, game: Game): void {
    this.gameTimeoutsCleanup(game);
    for (let i = 0; i < game.players.length; i++) {
      const p = game.players[i];
      if (p.type === 'bot' && !this.isSeatReserved(i, game.timeouts)) {
        game.players[i] = this.newPlayer(userId);
        game.invited.delete(userId);
        game.humans++;
        return;
      }
    }
    throw new ForbiddenException(GameErr.NO_SEAT_AVAILABLE);
  }

  private convertBotToReturningPlayer(userId: string, game: Game): boolean {
    const i = game.timeouts.findIndex((t) => t.occupant.id === userId);
    const timeout = game.timeouts[i];
    if (i === -1) {
      return false;
    }
    if (timeout.timer < Date.now()) {
      game.timeouts.splice(i, 1);
      return false;
    }
    game.players[timeout.seat] = this.newPlayer(timeout.occupant.id);
    if (timeout.leader === true) {
      game.leader = timeout.occupant.id;
    }
    game.timeouts.splice(i, 1);
    game.humans++;
    return true;
  }

  private gameTimeoutsCleanup(game: Game): void {
    for (let i = 0; game.timeouts[i]; i++) {
      const t = game.timeouts[i];
      if (t.timer < Date.now()) {
        this.userId_gameId.delete(t.occupant.id);
        if (game.leader === t.occupant.id) {
          this.updateLeader(game);
        }
        game.timeouts.splice(i, 1);
        i--;
      }
    }
  }

  private userTimeoutCleanup(userId: string): void {
    const gameId = this.getGameId(userId);
    if (!gameId) {
      return;
    }
    const game = this.getGame(gameId);
    if (!game) {
      this.userId_gameId.delete(userId);
      return;
    }
    this.gameTimeoutsCleanup(game);
    if (game.humans === 0 && game.timeouts.length === 0) {
      this.gameId_game.delete(game.gameId);
    }
  }

  private isSeatReserved(seat: number, timeouts: Timeout[]): boolean {
    return timeouts.some((t) => t.seat === seat && t.timer >= Date.now());
  }

  private newGame(seats: number): Game {
    return {
      gameId: v7(),
      seats: seats,
      humans: 0,
      players: [],
      timeouts: [],
      invited: new Map<string, string>(),
      leader: '',
    };
  }

  private newPlayer(userId: string): Occupant {
    return { type: 'human', id: userId };
  }

  private newBot(): Occupant {
    return { type: 'bot', id: 'bot' };
  }
}
