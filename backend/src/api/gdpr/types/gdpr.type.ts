import { OwnProfile, UserProfile } from 'src/api/user/types/user.types';
import { GDPRLobbyHistory, GDPRDMHistory } from 'src/api/chat/types/chat.types';

export type GDPRProfileData = {
  userProfile: OwnProfile;
  sentFriendRequests: UserProfile[];
  receivedFriendRequests: UserProfile[];
  friends: UserProfile[];
};

export type GDPRLobbyData = {
  lobbyMessages: GDPRLobbyHistory;
};

export type GDPRDMData = {
  you: UserProfile;
  friend: UserProfile;
  chatId: string;
  messages: GDPRDMHistory;
};
