import { Outlet } from 'react-router-dom';
import GlobalStyle from 'components/style/GlobalStyle';
import Footer from 'components/Footer';

function Layout() {
  return (
    <>
      <GlobalStyle />
      <Outlet />
      <Footer />
    </>
  );
}

export default Layout;
