export type UserLimited = {
  id: string;
  username: string;
  avatar: string;
  rank: string;
  isOnline: boolean;
};

export type User =
  | (UserLimited & {
      email: string;
      unverifiedEmail: string;
      description: string;
      registered: Date;
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
