import { createContext } from 'react';
import type { User, LimitedUser, Thread } from 'context/Types';

export type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  friends: LimitedUser[];
  setFriends: React.Dispatch<React.SetStateAction<LimitedUser[]>>;
  blocked: LimitedUser[];
  setBlocked: React.Dispatch<React.SetStateAction<LimitedUser[]>>;
  threads: Thread[];
  postMessage: (threadId: string, content: string) => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
