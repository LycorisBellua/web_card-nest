import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionRegistry {
  private readonly socketIdByUserId = new Map<string, string>();
  private readonly userIdBySocketId = new Map<string, string>();

  add(userId: string, socketId: string): void {
    const oldSocketId = this.socketIdByUserId.get(userId);
    if (oldSocketId && oldSocketId !== socketId) {
      this.userIdBySocketId.delete(oldSocketId);
    }
    this.userIdBySocketId.set(socketId, userId);
    this.socketIdByUserId.set(userId, socketId);
  }

  removeBySocketId(socketId: string): string | undefined {
    const userId = this.userIdBySocketId.get(socketId);
    if (!userId) {
      return undefined;
    }
    this.userIdBySocketId.delete(socketId);
    this.socketIdByUserId.delete(userId);
    return userId;
  }

  getUserId(socketId: string): string | undefined {
    return this.userIdBySocketId.get(socketId);
  }

  getSocketId(userId: string): string | undefined {
    return this.socketIdByUserId.get(userId);
  }

  getAllUserIds(): string[] {
    return Array.from(this.socketIdByUserId.keys());
  }
}
