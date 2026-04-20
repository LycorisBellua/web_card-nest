export type UserLimited = {
  username: string;
  avatar: string;
  isOnline: boolean;
};

export type User = {
  username: string;
  avatar: string;
  friends: UserLimited[];
} | null;
