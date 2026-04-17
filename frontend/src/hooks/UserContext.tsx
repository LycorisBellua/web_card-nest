import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type User = {
  username: string;
  avatar: string;
  friends: array;
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
    setUser({
      username: 'Wolf-Hart',
      avatar:
        'https://cdn.displate.com/artwork/270x380/2025-04-29/5d9a490e-781f-418f-ac6b-0d7cf866de6c.jpg',
      friends: [
        {
          username: 'Espresso',
          avatar:
            'https://pics.craiyon.com/2023-11-16/Gf0MaOtPQDeq60d49Ai6uA.webp',
          isOnline: true,
        },
        {
          username: 'Jookebox',
          avatar:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR_uvplX64OVu7oEysYZ5HjfMVUgjb9LEzEllowZk8UA&s',
          isOnline: true,
        },
        {
          username: 'Lumière',
          avatar:
            'https://college.taylors.edu.my/content/dam/taylorsrevamp/college/student-life/news-and-articles/2024/shadows-in-the-candles-glow-bringing-sustainability-to-light/taylors-article-shadows-in-the-candles-glow-hero-banner-mobile-768x650.png/jcr:content/renditions/cq5dam.web.768.650.webp',
          isOnline: false,
        },
        {
          username: 'MuffinTop',
          avatar:
            'https://www.shutterstock.com/image-photo/kawaiistyle-chocolate-muffin-smiling-big-600nw-2758545531.jpg',
          isOnline: true,
        },
        {
          username: 'Tealeaf',
          avatar:
            'https://thumbs.dreamstime.com/b/cute-kawaii-teapot-cartoon-floral-accent-illustration-cheerful-yellow-pink-lid-teal-handle-adorned-flower-style-445328393.jpg',
          isOnline: false,
        },
      ],
    });
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
