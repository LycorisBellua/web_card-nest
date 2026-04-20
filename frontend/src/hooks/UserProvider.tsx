import { /*useEffect,*/ useState } from 'react';
import { UserContext } from 'hooks/UserContext';
import type { User } from 'hooks/UserTypes';

export function UserProvider({ children }: { children: React.ReactNode }) {
  /*
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // TODO: Implement a real connection
    fetchUser().then(setUser);
  }, []);
  */

  const [user, setUser] = useState<User>({
    id: 'bbf5432o0qgurft60ujvd',
    username: 'Wolf-Hart',
    avatar:
      'https://cdn.displate.com/artwork/270x380/2025-04-29/5d9a490e-781f-418f-ac6b-0d7cf866de6c.jpg',
    rank: 'User',
    email: 'wolfhart@gmail.com',
    unverifiedEmail: '',
    description: 'Too school for cool 😎',
    registered: new Date('2026-03-12'),
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

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
