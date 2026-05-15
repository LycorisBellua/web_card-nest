import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ErrorMessages } from './error_messages/ErrorMessages';
import { Friend } from 'src/generated/prisma/browser';
import { Block, FriendStatus, Ranks } from 'src/generated/prisma/client';
import {
  blockInclude,
  BlockWithUsers,
  friendshipInclude,
  FriendshipWithUsers,
  FriendUser,
} from './types/rel.types';
import { WebsocketServer } from '../websocketGateway/websocket.gateway';
@Injectable()
export class RelService {
  constructor(
    // private readonly prisma: PrismaService,
    private readonly userService: UserService,
    // private  websocketServer: WebsocketServer,
  ) {}

  // FRIEND MANAGEMENT

  async UpdateFriendListDisplay(originId: string, targetId: string)
  {
    const friendListOid = await this.fetchFriendsList(originId);
    const friendListTargid = await this.fetchFriendsList(targetId);
    
    this.userService.WebsocketServer.emitFriendList({TargetUserId: targetId,  Friends: friendListTargid.FriendsList});
    this.userService.WebsocketServer.emitFriendList({TargetUserId: originId, Friends: friendListOid.FriendsList});
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
<<<<<<< HEAD
    const friendListOid = await this.fetchFriends(originId);
    const friendListTargid = await this.fetchFriends(targetId);
    if (!existing || existing.status === 'PENDING') {
      throw new BadRequestException(ErrorMessages.NOT_FRIENDS);
    }
    // this.userService.UpdateFriendFriendlist
    await this.deleteFriendship(existing)
    this.websocketServer.emitFriendList({TargetUserId: targetId,  Friends: friendListTargid});
    this.websocketServer.emitFriendList({TargetUserId: originId, Friends: friendListOid});
    return ;
=======
    if (!existing || existing.status === 'PENDING') {
      throw new BadRequestException(ErrorMessages.NOT_FRIENDS);
    }
    await this.deleteFriendship(existing);
    return await this.UpdateFriendListDisplay(originId, targetId);
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
  }

  async acceptRequest(originId: string, targetId: string) {
    await this.userChecks(originId, targetId);
    const blocked = await this.findBlock(originId, targetId);
    const found = await this.findFriendshipAsAddressee(originId, targetId);
    let friendListOid; 
    let friendListTargid;

    if (blocked || !found || found.status === FriendStatus.ACCEPTED) {
      throw new BadRequestException(ErrorMessages.REQ_NOT_FOUND);
    }
    await this.statusAccept(found);
<<<<<<< HEAD
    friendListOid = await this.fetchFriends(originId);
    friendListTargid = await this.fetchFriends(targetId);
    this.websocketServer.emitFriendList({TargetUserId: targetId,  Friends: friendListTargid});
    this.websocketServer.emitFriendList({TargetUserId: originId, Friends: friendListOid});
    
    return ;
=======
    return await this.UpdateFriendListDisplay(originId, targetId);
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
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
<<<<<<< HEAD
  private async findFriendshipAsRequester(originId: string, targetId: string) {
    return await this.prisma.friend.findUnique({
=======
  async findFriendshipAsRequester(originId: string, targetId: string) {
    return await this.userService.prisma.friend.findUnique({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        requesterId_addresseeId: {
          requesterId: originId,
          addresseeId: targetId,
        },
      },
    });
  }

<<<<<<< HEAD
  private async findFriendshipAsAddressee(originId: string, targetId: string) {
    return await this.prisma.friend.findUnique({
=======
  async findFriendshipAsAddressee(originId: string, targetId: string) {
    return await this.userService.prisma.friend.findUnique({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        requesterId_addresseeId: {
          requesterId: targetId,
          addresseeId: originId,
        },
      },
    });
  }

<<<<<<< HEAD
  private async findFriendship(originId: string, targetId: string) {
    return await this.prisma.friend.findFirst({
=======
  async findFriendship(originId: string, targetId: string) {
    return await this.userService.prisma.friend.findFirst({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        OR: [
          { requesterId: originId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: originId },
        ],
      },
    });
  }

<<<<<<< HEAD
  private async createFriendship(originId: string, targetId: string) {
    return await this.prisma.friend.create({
=======
  async createFriendship(originId: string, targetId: string) {
    return await this.userService.prisma.friend.create({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      data: {
        requesterId: originId,
        addresseeId: targetId,
      },
    });
  }

<<<<<<< HEAD
  private async deleteFriendship(friend: Friend) {
    return await this.prisma.friend.delete({
=======
  async deleteFriendship(friend: Friend) {
    return await this.userService.prisma.friend.delete({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        requesterId_addresseeId: {
          requesterId: friend.requesterId,
          addresseeId: friend.addresseeId,
        },
      },
    });
  }
<<<<<<< HEAD

  private async statusAccept(friend: Friend) {
    return await this.prisma.friend.update({
=======
  // async deleteFriendship(friend: Friend) {
  //   return await this.userService.prisma.friend.delete({
  //     where: {
  //       requesterId_addresseeId: {
  //         requesterId: friend.requesterId,
  //         addresseeId: friend.addresseeId,
  //       },
  //     },
  //   });
  // }
  async statusAccept(friend: Friend) {
    return await this.userService.prisma.friend.update({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        requesterId_addresseeId: {
          requesterId: friend.requesterId,
          addresseeId: friend.addresseeId,
        },
      },
      data: { status: FriendStatus.ACCEPTED },
    });
  }

<<<<<<< HEAD
  private async findAccepted(originId: string): Promise<FriendshipWithUsers> {
    return await this.prisma.friend.findMany({
=======
  async findAccepted(originId: string) {
    return await this.userService.prisma.friend.findMany({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        status: FriendStatus.ACCEPTED,
        OR: [{ requesterId: originId }, { addresseeId: originId }],
      },
      include: friendshipInclude,
    });
  }

<<<<<<< HEAD
  private async findSentPending(
    originId: string,
  ): Promise<FriendshipWithUsers> {
    return await this.prisma.friend.findMany({
=======
  async findSentPending(originId: string) {
    return await this.userService.prisma.friend.findMany({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
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
    let friendListOid; 
    let friendListTargid;
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
<<<<<<< HEAD
    friendListOid = await this.fetchFriends(originId);
    friendListTargid = await this.fetchFriends(targetId);
    this.websocketServer.emitFriendList({TargetUserId: targetId,  Friends: friendListTargid});
    this.websocketServer.emitFriendList({TargetUserId: originId, Friends: friendListOid});
=======
    await this.UpdateFriendListDisplay(originId, targetId);
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
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
<<<<<<< HEAD
  private async findBlock(blockerId: string, blockedId: string) {
    return await this.prisma.block.findUnique({
=======
  async findBlock(blockerId: string, blockedId: string) {
    return await this.userService.prisma.block.findUnique({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        blockerId_blockedId: {
          blockerId: blockerId,
          blockedId: blockedId,
        },
      },
    });
  }

<<<<<<< HEAD
  private async createBlock(originId: string, targetId: string) {
    return await this.prisma.block.create({
=======
  async createBlock(originId: string, targetId: string) {
    return await this.userService.prisma.block.create({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      data: {
        blockerId: originId,
        blockedId: targetId,
      },
    });
  }

<<<<<<< HEAD
  private async deleteBlock(block: Block) {
    return await this.prisma.block.delete({
=======
  async deleteBlock(block: Block) {
    return await this.userService.prisma.block.delete({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
      where: {
        blockerId_blockedId: {
          blockerId: block.blockerId,
          blockedId: block.blockedId,
        },
      },
    });
  }

<<<<<<< HEAD
  private async findBlockedUsers(originId: string) {
    return await this.prisma.block.findMany({
=======
  async findBlockedUsers(originId: string) {
    return await this.userService.prisma.block.findMany({
>>>>>>> 263264f (Chatroom event create with front component, chat private message done with front component, Realtime Friendlist done with front component)
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
