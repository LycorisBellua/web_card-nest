import { Outlet } from 'react-router-dom';
import GlobalStyle from 'components/global/GlobalStyle';
import Border from 'components/global/Border';
import Nav from 'components/global/Nav';
import Content from 'components/global/Content';
import Footer from 'components/global/Footer';

function Layout() {
  return (
    <>
      <GlobalStyle />
      <Border>
        <Nav />
        <Content>
          <Outlet />
        </Content>
      </Border>
      <Footer />
    </>
  );
}

export default Layout;
