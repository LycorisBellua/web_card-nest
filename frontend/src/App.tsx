import { Outlet } from 'react-router-dom';
import { UserProvider } from 'hooks/UserProvider';
import GlobalStyle from 'components/global/GlobalStyle';
import Border from 'components/global/Border';
import Nav from 'components/global/Nav';
import Content from 'components/global/Content';
import Sidebar from 'components/global/Sidebar';
import Page from 'components/global/Page';
import Footer from 'components/global/Footer';

function Layout() {
  return (
    <>
      <UserProvider>
        <GlobalStyle />
        <Border>
          <Nav />
          <Content>
            <Sidebar />
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
