import { Injectable, BadRequestException } from '@nestjs/common';
import { RelService } from '../relationships/rel.service';
import { UserService } from '../user/user.service';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import { SendMailService } from '../sendMail/sendMail.service';
import { ChatService } from '../chat/chat.service';
import { GDPR } from './types/gdpr.type';

@Injectable()
export class GdprService {
  constructor(
    private readonly relService: RelService,
    private readonly userService: UserService,
    private readonly sendMailService: SendMailService,
    private readonly chatService: ChatService,
  ) {}

  async GetAllUserData(userid: string): Promise<GDPR> {
    const profile = await this.userService.getOwnProfile(userid);
    const sentReq = await this.relService.fetchSentRequests(userid);
    const receivedReq = await this.relService.fetchReceivedRequests(userid);
    const friends = await this.relService.fetchFriends(userid);
    const dm = await this.chatService.fetchDMHistoryGDPR(userid);
    const lobby = await this.chatService.fetchLobbyHistoryGDPR(userid);

    return {
      userProfile: profile,
      sentFriendRequests: sentReq,
      receivedFriendRequests: receivedReq,
      friends,
      directMessages: dm,
      lobbyChatMessages: lobby,
    };
  }

  async SendExtractDataConfirmationEmail(userid: string) {
    const user = await this.userService.getOwnProfile(userid);
    const email = user.email ? user.email : user.email_unverified;
    if (!email) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }

    const message =
      'Dear ' +
      user.username +
      ',\n' +
      'Your personnal data have been successfully exported.\n' +
      'Best regards,\n' +
      'Web-Nest-Card Team.\n';
    await this.sendMailService.sendMail(
      email,
      'WEB-NEST-CARD DATA EXTRACTION CONFIRMATION',
      message,
    );
  }
}
