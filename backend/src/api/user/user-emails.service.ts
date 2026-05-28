import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendMailService } from '../sendMail/sendMail.service';
import { EmailContents } from './email_data/EmailContents';

@Injectable()
export class UserEmailsService {
  constructor(private readonly sendMailService: SendMailService) {}

  async sendVerificationEmail(userId: string, address: string, token: string) {
    const url = process.env.HOME_URL;
    if (url === undefined) {
      throw new InternalServerErrorException('Unable to verify Card Nest URL');
    }
    const verify_url = url + '/api/auth/' + userId + '/' + token + '/verify';
    const cancel_url = verify_url + '/cancel';
    await this.sendMailService.sendMail(
      address,
      EmailContents.VER_OBJ,
      EmailContents.VER_MSG.replace('VERIFY_URL', verify_url).replace(
        'CANCEL_URL',
        cancel_url,
      ),
    );
  }

  async sendPasswordResetUnverifiedEmail(userId: string, address: string, token: string) {
    const url = process.env.HOME_URL;
    if (url === undefined) {
        throw new InternalServerErrorException('Unable to verify Card Nest URL');
    }
    const verify_url = url + '/api/auth/' + userId + '/' + token + '/verify';
    const cancel_url = verify_url + '/cancel';
    await this.sendMailService.sendMail(
        address,
        EmailContents.PWD_RESET_UNVERIFIED_OBJ,
        EmailContents.PWD_RESET_UNVERIFIED_MSG
            .replace('VERIFY_URL', verify_url)
            .replace('CANCEL_URL', cancel_url),
    );
  }

  async sendVerificationSuccess(address: string) {
    const url = process.env.HOME_URL;
    if (url === undefined) {
      return;
    }
    await this.sendMailService.sendMail(
      address,
      EmailContents.VER_SUCCESS_OBJ,
      EmailContents.VER_SUCCESS_MESSAGE.replace('URL', url),
    );
  }

  async sendExpiredDeletionEmail(address: string) {
    await this.sendMailService.sendMail(
      address,
      EmailContents.EXP_DEL_OBJ,
      EmailContents.EXP_DEL_MSG,
    );
  }

  async sendExpiredModificationEmail(address: string, expired: string) {
    await this.sendMailService.sendMail(
      address,
      EmailContents.EXP_MOD_OBJ,
      EmailContents.EXP_MOD_MSG.replace('EMAIL', expired),
    );
  }

  async sendDeletionEmail(address: string) {
    await this.sendMailService.sendMail(
      address,
      EmailContents.DEL_OBJ,
      EmailContents.DEL_MSG,
    );
  }
}
