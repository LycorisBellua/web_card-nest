import { BadRequestException, Injectable } from '@nestjs/common';
import { v7 } from 'uuid'
import type { GameState, PlayerState } from '../types/game.types';

@Injectable()
export class GameRegistry {
  private gameId_gameState = new Map<string, GameState>();
  private userId_gameId = new Map<string, string>();

  createGame(userId: string, seats: number): GameState {
    if (this.userId_gameId.get(userId)) {
      throw new BadRequestException('User is already in a game');
    }
    game = new t();
  }

  private createGame(seats: number): GameState {
    return {
        gameId: new v7();
    }
  }

  private createPlayer(userId: string, seat: number): PlayerState {
    return {
      seat: seat,
      hand: [],
      status: 'waiting',
      controller: { type: 'human', id: userId },
      score: 0,
    };
  }
}
