import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v7 } from 'uuid';
import type { GameState, PlayerState } from '../types/game.types';
import { GameErr } from '../errors/game.errors';

@Injectable()
export class GameRegistry {
  private gameId_gameState = new Map<string, GameState>();
  private userId_gameId = new Map<string, string>();

  createGame(userId: string, seats: number): GameState {
    if (seats < 1 || seats > 4) {
      throw new BadRequestException(GameErr.SEATS);
    }
    if (this.userId_gameId.has(userId)) {
      throw new BadRequestException(GameErr.ALREADY_IN_GAME);
    }

    const game = this.newGame(seats);
    game.players.push(this.newPlayer(userId, 0));
    game.leader = userId;
    game.humans++;

    for (let i = 1; i < seats; i++) {
      game.players.push(this.newBot(i));
    }

    this.gameId_gameState.set(game.gameId, game);
    this.userId_gameId.set(userId, game.gameId);
    return game;
  }

  joinGame(joinerId: string, senderId: string): GameState {
    const existingGame = this.userId_gameId.get(joinerId);
    if (existingGame) {
      throw new ForbiddenException(GameErr.ALREADY_IN_GAME);
    }
    const gameId = this.userId_gameId.get(senderId);
    if (!gameId) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    const game = this.gameId_gameState.get(gameId);
    if (!game) {
      throw new NotFoundException(GameErr.GAME_NOT_FOUND);
    }
    if (game && game.humans >= game.seats) {
      throw new ForbiddenException(GameErr.NO_SEAT_AVAILABLE);
    }
    this.convertBotToNewPlayer(joinerId, game);
    return game;
  }

  leaveGame(userId: string): void {
    const gameId = this.userId_gameId.get(userId);
    if (!gameId) {
      throw new NotFoundException(GameErr.NOT_IN_GAME);
    }
    this.userId_gameId.delete(userId);
    const game = this.gameId_gameState.get(gameId);
    if (game && game.humans > 1) {
      this.convertPlayerToBot(game, userId, false);
      this.updateLeader(game);
    } else {
      this.gameId_gameState.delete(gameId);
    }
  }

  disconnectPlayer(userId: string): void {
    const gameId = this.userId_gameId.get(userId);
    if (!gameId) {
      throw new NotFoundException(GameErr.NOT_IN_GAME);
    }
    this.userId_gameId.delete(userId);
    const game = this.gameId_gameState.get(gameId);
    if (game && game.humans > 1) {
      this.convertPlayerToBot(game, userId, true);
      this.updateLeader(game);
    } else {
      this.gameId_gameState.delete(gameId);
    }
  }

  rejoinGame(userId: string): GameState {
    const gameId = this.userId_gameId.get(userId);
    if (!gameId) {
      throw new NotFoundException(GameErr.NOT_IN_GAME);
    }
    const game = this.gameId_gameState.get(gameId);
    if (!game) {
      throw new NotFoundException(GameErr.NOT_IN_GAME);
    }
    this.convertBotToReconnectedPlayer(userId, game);
    this.updateLeader(game);
    return game;
  }

  private updateLeader(game: GameState): void {
    for (const player of game.players) {
      if (player.controller.type === 'human') {
        game.leader = player.controller.id;
        return;
      }
    }
  }

  private convertPlayerToBot(
    game: GameState,
    userId: string,
    timeout: boolean,
  ) {
    for (const player of game.players) {
      if (player.controller.id === userId) {
        if (timeout) {
          player.timeout = {
            oldController: player.controller,
            timeout: Date.now() + 30_000,
          };
        }
        player.controller = { type: 'bot', id: 'bot' };
        game.humans--;
        break;
      }
    }
  }

  private convertBotToNewPlayer(userId: string, game: GameState): void {
    for (const player of game.players) {
      if (player.controller.type === 'bot') {
        player.controller = { type: 'human', id: userId };
        game.humans++;
        return;
      }
    }
  }

  private convertBotToReconnectedPlayer(userId: string, game: GameState): void {
    for (const player of game.players) {
      if (player.timeout) {
        if (player.timeout.oldController.id === userId) {
          if (player.timeout.timeout < Date.now()) {
            player.controller = player.timeout.oldController;
            player.timeout = null;
            game.humans++;
          } else {
            player.timeout = null;
          }
        }
      }
    }
  }

  private newGame(seats: number): GameState {
    return {
      gameId: v7(),
      seats: seats,
      humans: 0,
      players: [],
      turnIndex: 0,
      leader: '',
    };
  }

  private newPlayer(userId: string, seat: number): PlayerState {
    return {
      seat: seat,
      hand: [],
      status: 'waiting',
      controller: { type: 'human', id: userId },
      timeout: null,
    };
  }

  private newBot(seat: number): PlayerState {
    return {
      seat: seat,
      hand: [],
      status: 'waiting',
      controller: { type: 'bot', id: 'bot' },
      timeout: null,
    };
  }
}
