import { createContext } from 'react';
import type { User, LimitedUser, Thread } from 'context/Types';

export type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  blocked: LimitedUser[];
  setBlocked: React.Dispatch<React.SetStateAction<LimitedUser[]>>;
  friends: LimitedUser[];
  setFriends: React.Dispatch<React.SetStateAction<LimitedUser[]>>;
  sentFriends: LimitedUser[];
  setSentFriends: React.Dispatch<React.SetStateAction<LimitedUser[]>>;
  receivedFriends: LimitedUser[];
  setReceivedFriends: React.Dispatch<React.SetStateAction<LimitedUser[]>>;
  threads: Thread[];
  postMessage: (threadId: string, content: string) => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
