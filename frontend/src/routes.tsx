import Layout from 'App';
import Lobby from 'pages/Lobby';
import Auth from 'pages/Auth';
import ResetPassword from 'pages/ResetPassword';
import ResetPasswordSecond from 'pages/ResetPassword2';
import VerifyError from 'pages/VerifyError';
import VerifySuccess from 'pages/VerifySuccess';
import Users from 'pages/Users';
import PublicProfile from 'pages/PublicProfile';
import PrivateProfile from 'pages/PrivateProfile';
import Play from 'game/Play';
import PrivacyPolicy from 'pages/PrivacyPolicy';
import TermsOfService from 'pages/TermsOfService';
import Credits from 'pages/Credits';
import NotFound from 'pages/NotFound';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Lobby /> },
      { path: 'auth', element: <Auth /> },
      { path: 'reset-pwd', element: <ResetPassword /> },
      { path: 'reset-pwd2', element: <ResetPasswordSecond /> },
      { path: 'verify-success', element: <VerifySuccess /> },
      { path: 'verify-error', element: <VerifyError /> },
      { path: 'users', element: <Users /> },
      { path: 'user/:username', element: <PublicProfile /> },
      { path: 'profile', element: <PrivateProfile /> },
      { path: 'play', element: <Play /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;
