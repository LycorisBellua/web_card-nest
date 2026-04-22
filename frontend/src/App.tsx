import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UserProvider } from 'hooks/UserProvider';
import GlobalStyle from 'components/general/GlobalStyle';
import Border from 'components/general/Border';
import Nav from 'components/general/Nav';
import Content from 'components/general/Content';
import Sidebar from 'components/general/Sidebar';
import Page from 'components/general/Page';
import Footer from 'components/general/Footer';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <UserProvider>
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
      </UserProvider>
    </>
  );
}

export default Layout;
