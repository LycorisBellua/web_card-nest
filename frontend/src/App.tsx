import { Outlet } from 'react-router-dom';
import GlobalStyle from 'components/style/GlobalStyle';
import Footer from 'components/Footer';
import Home from 'pages/Home';
import Placeholder from 'pages/Placeholder';
import SignUp from 'pages/SignUp';
import LogIn from 'pages/LogIn';
import ResetPassword from 'pages/ResetPassword';
import ResetPasswordSecond from 'pages/ResetPassword2';
import PrivacyPolicy from 'pages/PrivacyPolicy';
import TermsOfService from 'pages/TermsOfService';
import Credits from 'pages/Credits';
import NotFound from 'pages/NotFound';

export function Layout() {
  return (
    <>
      <GlobalStyle />
      <Outlet />
      <Footer />
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
      { path: 'reset-pwd2', element: <ResetPasswordSecond /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
