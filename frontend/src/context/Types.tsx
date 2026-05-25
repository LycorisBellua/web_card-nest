export type LimitedUser = {
  id: string;
  username: string;
  avatar: string;
  rank: string;
};

export type OtherUser = LimitedUser & {
  registered: Date;
  desc: string;
  isOnline: boolean;
  friends: LimitedUser[];
};

export type User =
  | (OtherUser & {
      email: string;
      unverifiedEmail: string;
      accessToken: string;
    })
  | null;

export type OtherUserOrGuest = OtherUser | null;

export type Msg = {
  id: string;
  authorId: string | null;
  created: Date;
  content: string;
  moderated: boolean;
};

export type Thread = {
  id: string;
  type: 'group' | 'dm';
  messages: Msg[];
};
