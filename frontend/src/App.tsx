import { Outlet } from 'react-router-dom';
import GlobalStyle from 'components/GlobalStyle';
import Border from 'components/Border';
import Body from 'components/Body';
import Footer from 'components/Footer';

/*
  TODO
  - Add the navbar like so:

      <GlobalStyle />
      <Border>
        <NavBar />
        <Body>
          <Outlet />
        </Body>
      </Border>
      <Footer />
*/

function Layout() {
  return (
    <>
      <GlobalStyle />
      <Border>
        <Body>
          <Outlet />
        </Body>
      </Border>
      <Footer />
    </>
  );
}

export default Layout;
