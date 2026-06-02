import { useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { UserProvider } from 'context/UserProvider';
import { useUser } from 'context/useUser';
import { SocketProvider } from 'tmp-ws/SocketProvider';
import GlobalStyle from 'components/general/GlobalStyle';
import Border from 'components/general/Border';
import Nav from 'components/general/Nav';
import Content from 'components/general/Content';
import Sidebar from 'components/general/Sidebar';
import Page from 'components/general/Page';
import Footer from 'components/general/Footer';

function AppWithSocket({ children }: { children: ReactNode }) {
  const { user } = useUser();
  return (
    <SocketProvider userId={user ? user.id : 'Guest'}>
      {children}
    </SocketProvider>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <>
      <UserProvider>
        <AppWithSocket>
          <GlobalStyle />
          <Border>
            <Nav onDMsClick={() => setSidebarOpen(true)} />
            <Content>
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              <Page>
                <Outlet />
              </Page>
            </Content>
          </Border>
          <Footer />
        </AppWithSocket>
      </UserProvider>
    </>
  );
}

export default Layout;
