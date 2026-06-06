import { Injectable, BadRequestException } from '@nestjs/common';
import { RelService } from '../relationships/rel.service';
import { UserService } from '../user/user.service';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import { SendMailService } from '../sendMail/sendMail.service';
import { ChatService } from '../chat/chat.service';
import { GDPRProfileData, GDPRLobbyData, GDPRDMData } from './types/gdpr.type';
import { UserProfile } from '../user/types/user.types';
import { Ranks } from 'src/generated/prisma/enums';

@Injectable()
export class GdprService {
  constructor(
    private readonly relService: RelService,
    private readonly userService: UserService,
    private readonly sendMailService: SendMailService,
    private readonly chatService: ChatService,
  ) {}

  async GetProfileData(userId: string): Promise<GDPRProfileData> {
    const profile = await this.userService.getOwnProfile(userId);
    profile.avatar = null;
    const sentReq = await this.relService.fetchSentRequests(userId);
    const receivedReq = await this.relService.fetchReceivedRequests(userId);
    const friends = await this.relService.fetchFriends(userId);

    return {
      userProfile: profile,
      sentFriendRequests: this.setAvatarToNull(sentReq),
      receivedFriendRequests: this.setAvatarToNull(receivedReq),
      friends: this.setAvatarToNull(friends),
    };
  }

  async GetLobbyData(userId: string): Promise<GDPRLobbyData> {
    const messages = await this.chatService.fetchLobbyHistoryGDPR();
    const hasParticipated = messages.some(
      (msg) => msg.senderId !== null && msg.senderId === userId,
    );
    if (!hasParticipated) return { lobbyMessages: [] };
    return { lobbyMessages: messages };
  }

  async GetDMData(userId: string, friendId: string): Promise<GDPRDMData> {
    const you = await this.userService.getUserById(Ranks.ADMIN, userId);
    you.avatar = null;
    const friend = await this.userService.getUserById(Ranks.ADMIN, friendId);
    friend.avatar = null;
    const thread = await this.chatService.fetchDMHistoryGDPR(userId, friendId);
    const chatId = thread.chatId;
    const messages = thread.messages;
    return { you, friend, chatId, messages };
  }

  async FindFriendName(friendId: string): Promise<string> {
    return await this.userService.findUsername(friendId);
  }

  private setAvatarToNull(original: UserProfile[]): UserProfile[] {
    const users = original;
    for (const user of users) {
      user.avatar = null;
    }
    return users;
  }

  async SendExtractDataConfirmationEmail(userId: string, categories: string[]) {
    const user = await this.userService.getOwnProfile(userId);
    const email = user.email ? user.email : user.email_unverified;
    if (!email) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }

    const list = categories.map((c) => `<li>${c}</li>`).join('');
    const message =
      '<p>Dear ' +
      user.username +
      ',</p>' +
      '<p>Your personal data has been successfully exported. You have requested:</p>' +
      `<ul>${list}</ul>` +
      '<p>Best regards,\nCard Nest.</p>\n';

    await this.sendMailService.sendMail(
      email,
      'Card Nest - Data extraction confirmation',
      message,
    );
  }
}
