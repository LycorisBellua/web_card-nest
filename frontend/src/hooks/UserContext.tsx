import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Props = {
   children: ReactNode;
};

type User = {
  username: string;
  avatar: string;
} | null;

type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: Props) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // Comment/Uncomment the setUser line to simulate the user being logged in
    // TODO: Implement a real connection
    /*
    setUser({
      username: 'Wolf-Hart',
      avatar: 'https://cdn.displate.com/artwork/270x380/2025-04-29/5d9a490e-781f-418f-ac6b-0d7cf866de6c.jpg',
    });
    */
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
