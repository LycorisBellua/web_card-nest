import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ErrorMessages } from './error_messages/ErrorMessages';
import { Friend } from 'src/generated/prisma/browser';
import { WebsocketServer } from '../websocketGateway/websocket.gateway';
import { Block, FriendStatus, Ranks } from 'src/generated/prisma/client';
import {
  blockInclude,
  BlockWithUsers,
  friendshipInclude,
  FriendshipWithUsers,
  FriendUser,
} from './types/rel.types';

@Injectable()
export class RelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    // private  websocketServer: WebsocketServer,
  ) {}

  // FRIEND MANAGEMENT

  async UpdateFriendListDisplay(originId: string, targetId: string)
  {
    const friendListOid = await this.fetchFriends(originId);
    const friendListTargid = await this.fetchFriends(targetId);
    
    this.userService.WebsocketServer.emitFriendList({TargetUserId: targetId,  Friends: friendListTargid});
    this.userService.WebsocketServer.emitFriendList({TargetUserId: originId, Friends: friendListOid});
  }

  async addFriend(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    if (await this.findBlock(originId, targetId)) {
      throw new BadRequestException(ErrorMessages.ADD_UNBLOCK);
    }
    const existing = await this.findFriendship(originId, targetId);
    if (existing) {
      if (existing.status === FriendStatus.ACCEPTED) {
        throw new BadRequestException(ErrorMessages.ADD_ALREADY);
      } else if (
        existing.status === FriendStatus.PENDING &&
        existing.requesterId === originId
      ) {
        throw new BadRequestException(ErrorMessages.ADD_PENDING);
      } else {
        return await this.statusAccept(existing);
      }
    }
    return await this.createFriendship(originId, targetId);
  }

  async removeFriend(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    const existing = await this.findFriendship(originId, targetId);
    if (!existing || existing.status === FriendStatus.PENDING) {
      throw new BadRequestException(ErrorMessages.NOT_FRIENDS);
    }
    await this.deleteFriendship(existing);
    return await this.UpdateFriendListDisplay(originId, targetId);
  }

  async acceptRequest(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    const blocked = await this.findBlock(originId, targetId);
    const found = await this.findFriendshipAsAddressee(originId, targetId);
    if (blocked || !found || found.status === FriendStatus.ACCEPTED) {
      throw new BadRequestException(ErrorMessages.REQ_NOT_FOUND);
    }
    await this.statusAccept(found);
    return await this.UpdateFriendListDisplay(originId, targetId);
  }

  async rejectRequest(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    const blocked = await this.findBlock(originId, targetId);
    const found = await this.findFriendshipAsAddressee(originId, targetId);
    if (blocked || !found || found.status === FriendStatus.ACCEPTED) {
      throw new BadRequestException(ErrorMessages.REQ_NOT_FOUND);
    }
    return await this.deleteFriendship(found);
  }

  async cancelRequest(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    const found = await this.findFriendshipAsRequester(originId, targetId);
    if (!found || found.status === FriendStatus.ACCEPTED) {
      throw new BadRequestException(ErrorMessages.REQ_NOT_FOUND);
    }
    return await this.deleteFriendship(found);
  }

  async fetchFriends(originId: string) {
    await this.userService.userExistsOrThrow(originId);
    const accepted: FriendshipWithUsers = await this.findAccepted(originId);
    const friends = this.buildFriendList(originId, accepted);
    return friends.sort((a, b) => a.username.localeCompare(b.username));
  }

  async fetchSentRequests(originId: string) {
    await this.userService.userExistsOrThrow(originId);
    const sent = await this.findSentPending(originId);
    return this.buildFriendList(originId, sent);
  }

  async fetchReceivedRequests(originId: string) {
    await this.userService.userExistsOrThrow(originId);
    const received = await this.findReceivedPending(originId);
    return this.buildFriendList(originId, received);
  }

  // FRIEND DB ACTIONS
  private async findFriendshipAsRequester(originId: string, targetId: string) {
    return await this.prisma.friend.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: originId,
          addresseeId: targetId,
        },
      },
    });
  }

  private async findFriendshipAsAddressee(originId: string, targetId: string) {
    return await this.prisma.friend.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: targetId,
          addresseeId: originId,
        },
      },
    });
  }

  private async findFriendship(originId: string, targetId: string) {
    return await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: originId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: originId },
        ],
      },
    });
  }

  private async createFriendship(originId: string, targetId: string) {
    return await this.prisma.friend.create({
      data: {
        requesterId: originId,
        addresseeId: targetId,
      },
    });
  }

  private async deleteFriendship(friend: Friend) {
    return await this.prisma.friend.delete({
      where: {
        requesterId_addresseeId: {
          requesterId: friend.requesterId,
          addresseeId: friend.addresseeId,
        },
      },
    });
  }

  private async statusAccept(friend: Friend) {
    return await this.prisma.friend.update({
      where: {
        requesterId_addresseeId: {
          requesterId: friend.requesterId,
          addresseeId: friend.addresseeId,
        },
      },
      data: { status: FriendStatus.ACCEPTED },
    });
  }

  private async findAccepted(originId: string): Promise<FriendshipWithUsers> {
    return await this.prisma.friend.findMany({
      where: {
        status: FriendStatus.ACCEPTED,
        OR: [{ requesterId: originId }, { addresseeId: originId }],
      },
      include: friendshipInclude,
    });
  }

  private async findSentPending(
    originId: string,
  ): Promise<FriendshipWithUsers> {
    return await this.prisma.friend.findMany({
      where: {
        requesterId: originId,
        status: FriendStatus.PENDING,
      },
      include: friendshipInclude,
      orderBy: { addressee: { username: 'asc' } },
    });
  }

  private async findReceivedPending(originId: string) {
    const blocked = await this.findBlockedUsers(originId);
    const blockedIds = blocked.map((blockedId) => blockedId.blockedId);
    return await this.userService.prisma.friend.findMany({
      where: {
        addresseeId: originId,
        status: FriendStatus.PENDING,
        requesterId: { notIn: blockedIds },
      },
      include: friendshipInclude,
      orderBy: { requester: { username: 'asc' } },
    });
  }

  // BLOCK MANAGEMENT
  async blockUser(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    const blocked = await this.findBlock(originId, targetId);
    if (blocked) {
      throw new BadRequestException(ErrorMessages.BLOCK_ALREADY);
    }
    const friendship = await this.findFriendship(originId, targetId);
    if (
      friendship &&
      (friendship.status == 'ACCEPTED' || friendship.requesterId === originId)
    ) {
      await this.deleteFriendship(friendship);
    }
    await this.UpdateFriendListDisplay(originId, targetId);
    return await this.createBlock(originId, targetId);
  }

  async unblockUser(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    const existing = await this.findBlock(originId, targetId);
    if (!existing) {
      throw new BadRequestException(ErrorMessages.BLOCK_NOT_BLOCKED);
    }
    return await this.deleteBlock(existing);
  }

  async fetchBlocked(originId: string) {
    await this.userService.userExistsOrThrow(originId);
    const blocked = await this.findBlockedUsers(originId);
    return this.buildBlockList(blocked);
  }

  // BLOCK DB ACTIONS
  private async findBlock(blockerId: string, blockedId: string) {
    return await this.prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: blockerId,
          blockedId: blockedId,
        },
      },
    });
  }

  private async createBlock(originId: string, targetId: string) {
    return await this.prisma.block.create({
      data: {
        blockerId: originId,
        blockedId: targetId,
      },
    });
  }

  private async deleteBlock(block: Block) {
    return await this.prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: block.blockerId,
          blockedId: block.blockedId,
        },
      },
    });
  }

  private async findBlockedUsers(originId: string) {
    return await this.prisma.block.findMany({
      where: { blockerId: originId },
      include: blockInclude,
      orderBy: { blocked: { username: 'asc' } },
    });
  }

  // USER LOOKUP
  private async userChecks(originId: string, targetId: string) {
    await this.userService.userExistsOrThrow(originId);
    const target = await this.userService.userExistsOrThrow(targetId);
    if (originId === targetId) {
      throw new BadRequestException(ErrorMessages.SELF);
    }
    if (target.rank === Ranks.PENDING) {
      throw new BadRequestException(ErrorMessages.TARGET_NOT_FOUND);
    }
  }

  // UTILS
  private buildFriendList(
    originId: string,
    list: FriendshipWithUsers,
  ): FriendUser[] {
    return list.map((l) => {
      return l.requesterId === originId ? l.addressee : l.requester;
    });
  }

  private buildBlockList(list: BlockWithUsers): FriendUser[] {
    return list.map((l) => {
      return l.blocked;
    });
  }
}
