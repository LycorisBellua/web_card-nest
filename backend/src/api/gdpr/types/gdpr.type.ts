import { GDPRDMHistory, GDPRLobbyMessage } from 'src/api/chat/types/chat.types';
import { OwnProfile, UserProfile } from 'src/api/user/types/user.types';

export type GDPR = {
  userProfile: OwnProfile;
  sentFriendRequests: UserProfile[];
  receivedFriendRequests: UserProfile[];
  friends: UserProfile[];
  directMessages: GDPRDMHistory;
  lobbyChatMessages: GDPRLobbyMessage[];
};
