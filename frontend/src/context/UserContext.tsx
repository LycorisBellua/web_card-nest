import { createContext } from 'react';
import type { User, UserLimited } from 'context/Types';

export type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  users: UserLimited[];
  friends: UserLimited[];
  addFriend: (username: string) => void;
  removeFriend: (username: string) => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
