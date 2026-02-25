import { Outlet } from 'react-router-dom';
import GlobalStyle from 'components/style/GlobalStyle';
import Home from 'pages/Home';
import Placeholder from 'pages/Placeholder';
import NotFound from 'pages/NotFound';
import SignUp from 'pages/SignUp';
import LogIn from 'pages/LogIn';
import ResetPassword from 'pages/ResetPassword';

export function Layout() {
  return (
    <>
      <GlobalStyle />
      <Outlet />
    </>
  );
}

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'placeholder', element: <Placeholder /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'login', element: <LogIn /> },
      { path: 'reset-pwd', element: <ResetPassword /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
