export type UserLimited = {
  username: string;
  avatar: string;
  isOnline: boolean;
};

export type User = {
  id: string;
  username: string;
  avatar: string;
  rank: string;
  email: string;
  unverifiedEmail: string;
  description: string;
  registered: Date;
  friends: UserLimited[];
} | null;
