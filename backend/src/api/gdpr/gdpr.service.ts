import { Injectable, BadRequestException } from '@nestjs/common';
import { RelService } from '../relationships/rel.service';
import { UserService } from '../user/user.service';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';
import { SendMailService } from '../sendMail/sendMail.service';

@Injectable()
export class GdprService {
  constructor(
    private readonly RelService: RelService,
    private readonly UserService: UserService,
    private readonly SendMailService: SendMailService,
  ) {}

  async GetAllUserData(userid: string) {
    const user_setting_info = await this.UserService.getOwnProfile(userid);
    const userFriendSentRequest_info =
      await this.RelService.fetchSentRequests(userid);
    const userFriendReceivedRequest_info =
      await this.RelService.fetchReceivedRequests(userid);
    const userFriendship = await this.RelService.fetchFriends(userid);

    if (!user_setting_info) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }

    return {
      user_setting_info,
      userFriendSentRequest_info,
      userFriendReceivedRequest_info,
      userFriendship,
    };
  }

  async SendExctractDataConfirmationEmail(userid: string) {
    const user = await this.UserService.getOwnProfile(userid);
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
    await this.SendMailService.sendMail(
      email,
      'WEB-NEST-CARD DATA EXTRACTION CONFIRMATION',
      message,
    );
  }
}
