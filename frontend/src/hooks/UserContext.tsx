import { createContext } from 'react';
import type { User } from 'hooks/Types';

export type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
