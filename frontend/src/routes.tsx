import Layout from 'App';
import Home from 'pages/Home';
import SignUp from 'pages/SignUp';
import LogIn from 'pages/LogIn';
import ResetPassword from 'pages/ResetPassword';
import ResetPasswordSecond from 'pages/ResetPassword2';
import Profile from 'pages/Profile';
import PrivacyPolicy from 'pages/PrivacyPolicy';
import TermsOfService from 'pages/TermsOfService';
import Credits from 'pages/Credits';
import PlayGame from 'pages/PlayGame';
import NotFound from 'pages/NotFound';
import VerifyError from 'pages/VerifyError';
import VerifySuccess from 'pages/VerifySuccess';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'login', element: <LogIn /> },
      { path: 'reset-pwd', element: <ResetPassword /> },
      { path: 'reset-pwd2', element: <ResetPasswordSecond /> },
      { path: 'profile', element: <Profile /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: 'play-game', element: <PlayGame /> },
      { path: '*', element: <NotFound /> },
      { path: 'verify-success', element: <VerifySuccess /> },
      { path: 'verify-error', element: <VerifyError /> },
    ],
  },
];

export default routes;
