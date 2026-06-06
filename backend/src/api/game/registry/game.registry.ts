import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v7 } from 'uuid';
import type { Game, Occupant } from '../types/game.types';
import { GameErr } from '../errors/game.errors';
import { CreateGameDto } from '../dto/creategame.dto';
import { JoinGameDto } from '../dto/joingame.dto';
import { LeaveGameDto } from '../dto/leavegame.dto';
import { InviteGameDto } from '../dto/invitegame.dto';

@Injectable()
export class GameRegistry {
  private gameId_game = new Map<string, Game>();
  private userId_gameId = new Map<string, string>();

  createGame(dto: CreateGameDto): Game {
    const seats = dto.seats;
    const userId = dto.userId;
    if (seats < 1 || seats > 4) {
      throw new BadRequestException(GameErr.SEATS);
    }
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
    if (this.getGameId(joinerId)) {
      throw new ForbiddenException(GameErr.ALREADY_IN_GAME);
    }
    const game = this.getGameState(gameId);
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
    const game = this.getGameState(gameId);
    if (!game) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    if (game.humans > 1) {
      const wasLeader = game.leader === userId;
      this.convertPlayerToBot(game, userId);
      if (wasLeader) {
        this.updateLeader(game);
      }
    } else {
      this.gameId_game.delete(gameId);
    }
    return game;
  }

  inviteToGame(dto: InviteGameDto): Game {
    const leaderId = dto.leaderId;
    const invitedId = dto.invitedId;
    const game = this.getGameState(dto.gameId);
    if (!game || leaderId !== game.leader) {
      throw new ForbiddenException(GameErr.ONLY_LEADER_INVITE);
    }
    if (game.humans === game.seats) {
      throw new BadRequestException(GameErr.NO_SEAT_AVAILABLE);
    }
    game.invited.add(invitedId);
    return game;
  }

  rejectInvite(dto: JoinGameDto): Game {
    const joinerId = dto.joinerId;
    const gameId = dto.gameId;
    const game = this.getGameState(gameId);
    if (!game) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    if (!game.invited.has(joinerId)) {
      throw new BadRequestException(GameErr.NOT_INVITED);
    }
    game.invited.delete(joinerId);
    return game;
  }

  private getGameId(userId: string): string | undefined {
    return this.userId_gameId.get(userId);
  }

  private getGameState(gameId: string): Game | undefined {
    return this.gameId_game.get(gameId);
  }

  private updateLeader(game: Game): void {
    for (const player of game.players) {
      if (player.type === 'human') {
        game.leader = player.id;
        return;
      }
    }
  }

  private convertPlayerToBot(game: Game, userId: string) {
    for (let player of game.players) {
      if (player.id === userId) {
        player = this.newBot();
        game.humans--;
        break;
      }
    }
  }

  private convertBotToNewPlayer(userId: string, game: Game): void {
    for (let player of game.players) {
      if (player.type === 'bot') {
        player = this.newPlayer(userId);
        game.invited.delete(userId);
        game.humans++;
        return;
      }
    }
    throw new ForbiddenException(GameErr.NO_SEAT_AVAILABLE);
  }

  private newGame(seats: number): Game {
    return {
      gameId: v7(),
      seats: seats,
      humans: 0,
      players: [],
      invited: new Set<string>(),
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
