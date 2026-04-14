import { Outlet } from 'react-router-dom';
import GlobalStyle from 'components/GlobalStyle';
import Border from 'components/Border';
import Content from 'components/Content';
import Footer from 'components/Footer';

/*
  TODO
  - Add the navbar like so:

      <GlobalStyle />
      <Border>
        <NavBar />
        <Content>
          <Outlet />
        </Content>
      </Border>
      <Footer />
*/

function Layout() {
  return (
    <>
      <GlobalStyle />
      <Border>
        <Content>
          <Outlet />
        </Content>
      </Border>
      <Footer />
    </>
  );
}

export default Layout;
