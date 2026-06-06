import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionRegistry {
  private readonly userId_socketId = new Map<string, string>();
  private readonly socketId_userId = new Map<string, string>();

  add(userId: string, socketId: string): string | undefined {
    const oldSocketId = this.userId_socketId.get(userId);
    if (oldSocketId && oldSocketId !== socketId) {
      this.socketId_userId.delete(oldSocketId);
    }
    this.socketId_userId.set(socketId, userId);
    this.userId_socketId.set(userId, socketId);
    return oldSocketId !== socketId ? oldSocketId : undefined;
  }

  removeBySocketId(socketId: string): string | undefined {
    const userId = this.socketId_userId.get(socketId);
    if (!userId) {
      return undefined;
    }
    this.socketId_userId.delete(socketId);
    this.userId_socketId.delete(userId);
    return userId;
  }

  getUserId(socketId: string): string | undefined {
    return this.socketId_userId.get(socketId);
  }

  getSocketId(userId: string): string | undefined {
    return this.userId_socketId.get(userId);
  }

  getAllUserIds(): string[] {
    return Array.from(this.userId_socketId.keys());
  }

  isOnline(userId: string): boolean {
    return this.userId_socketId.has(userId);
  }
}
