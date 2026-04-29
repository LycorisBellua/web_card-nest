export type UserLimited = {
  id: string;
  username: string;
  avatar: string;
  rank: string;
  registered: Date;
  description: string;
  isOnline: boolean;
};

export type User =
  | (UserLimited & {
      email: string;
      unverifiedEmail: string;
      accessToken: string;
    })
  | null;

export type UserLimitedOrGuest = UserLimited | null;

export type Msg = {
  id: string;
  authorId: string | null;
  created: Date;
  content: string;
};

export type Thread = {
  id: string;
  type: 'group' | 'dm';
  messages: Msg[];
};
