import { Injectable, BadRequestException, } from '@nestjs/common';
import { RelService } from '../relationships/rel.service';
import { UserService } from '../user/user.service';
import { ErrorMessages } from '../user/error_messages/ErrorMessages';


@Injectable()
export class GdprService{
  constructor(
    private readonly RelService: RelService,
    private readonly UserService: UserService,
  ) {}
  
  
   async GetAllUserData(userid: string)
  {
    // console.log("user_id : ", userid);
    const user_setting_info = await this.UserService.getUserById(userid);
    const userFriendSentRequest_info = await this.RelService.fetchSentRequests(userid);
    const userFriendReceivedRequest_info = await this.RelService.fetchReceivedRequests(userid);
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

  // async GetUserPersonalData(userid: string)
  // {
  //   // console.log("user_id : ", userid);
  //   const user_setting_info = await this.UserService.getUserById(userid);
  //   // const userFriendSentRequest_info = await this.RelService.fetchSentRequests(userid);
  //   // const userFriendReceivedRequest_info = await this.RelService.fetchReceivedRequests(userid);
  //   // const userFriendship = await this.RelService.fetchFriends(userid);
    
  //   if (!user_setting_info) {
  //       throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
  //   }

  //   return {
  //       user_setting_info
  //       // userFriendSentRequest_info,
  //       // userFriendReceivedRequest_info,
  //       // userFriendship,
  //   };
  // }


  // async GetUserFriendSentRequestData(userid: string)
  // {
  //   // console.log("user_id : ", userid);
  //   // const user_setting_info = await this.UserService.getUserById(userid);
  //   const userFriendSentRequest_info = await this.RelService.fetchSentRequests(userid);
  //   // const userFriendReceivedRequest_info = await this.RelService.fetchReceivedRequests(userid);
  //   // const userFriendship = await this.RelService.fetchFriends(userid);
    
  //   if (!userFriendSentRequest_info) {
  //       throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
  //   }

  //   return {
  //       // user_setting_info,
  //       userFriendSentRequest_info,
  //       // userFriendReceivedRequest_info,
  //       // userFriendship,
  //   };
  // }

  // async GetUserFriendReceivedRequestData(userid: string)
  // {
  //   // console.log("user_id : ", userid);
  //   // const user_setting_info = await this.UserService.getUserById(userid);
  //   // const userFriendSentRequest_info = await this.RelService.fetchSentRequests(userid);
  //   const userFriendReceivedRequest_info = await this.RelService.fetchReceivedRequests(userid);
  //   // const userFriendship = await this.RelService.fetchFriends(userid);
    
  //   if (!userFriendReceivedRequest_info) {
  //       throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
  //   }

  //   return {
  //       // user_setting_info,
  //       // userFriendSentRequest_info,
  //       userFriendReceivedRequest_info,
  //       // userFriendship,
  //   };
  // }


  // async GetUserFriendshipData(userid: string)
  // {
  //   // console.log("user_id : ", userid);
  //   // const user_setting_info = await this.UserService.getUserById(userid);
  //   // const userFriendSentRequest_info = await this.RelService.fetchSentRequests(userid);
  //   // const userFriendReceivedRequest_info = await this.RelService.fetchReceivedRequests(userid);
  //   const userFriendship = await this.RelService.fetchFriends(userid);
    
  //   if (!userFriendship) {
  //       throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
  //   }

  //   return {
  //       // user_setting_info,
  //       // userFriendSentRequest_info,
  //       // userFriendReceivedRequest_info,
  //       userFriendship,
  //   };
  // }


}