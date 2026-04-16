import { Outlet } from 'react-router-dom';
import { UserProvider } from 'context/UserContext';
import GlobalStyle from 'components/global/GlobalStyle';
import Border from 'components/global/Border';
import Nav from 'components/global/Nav';
import Content from 'components/global/Content';
import Footer from 'components/global/Footer';

function Layout() {
  return (
    <>
      <GlobalStyle />
      <UserProvider>
        <Border>
          <Nav />
          <Content>
            <Outlet />
          </Content>
        </Border>
        <Footer />
      </UserProvider>
    </>
  );
}

export default Layout;
