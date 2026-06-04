export type LimitedUser = {
  id: string;
  username: string;
  avatar: string;
  rank: string;
};

export type OtherUser = LimitedUser & {
  registered: Date;
  desc: string;
  friends: LimitedUser[];
};

export type User =
  | (OtherUser & {
      email: string;
      email_unverified: string;
      accessToken: string;
    })
  | null;

export type OtherUserOrGuest = OtherUser | null;

export type PublicMsg = {
  id: string;
  senderId: string | null;
  message: string;
  date: Date;
  moderated: boolean;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
    desc: string | null;
    rank: string;
  } | null;
};

export type PrivateMsg = {
  id: string;
  senderId: string;
  message: string;
  date: Date;
  chatId: string;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
    desc: string | null;
    rank: string;
  };
};
