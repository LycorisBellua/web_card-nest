import Layout from 'App';
<<<<<<< HEAD
import Home from 'pages/Home';
import SignUp from 'pages/SignUp';
import LogIn from 'pages/LogIn';
import ResetPassword from 'pages/ResetPassword';
import ResetPasswordSecond from 'pages/ResetPassword2';
import VerifySuccess from 'pages/VerifySuccess';
import VerifyError from 'pages/VerifyError';
import VerifyCancel from 'pages/VerifyCancel';
import Profile from 'pages/Profile';
=======
import Lobby from 'pages/chat/Lobby';
import Auth from 'pages/auth/Auth';
import ResetPassword from 'pages/auth/ResetPassword';
import ResetPasswordSecond from 'pages/auth/ResetPassword2';
import VerifySuccess from 'pages/auth/VerifySuccess';
import VerifyError from 'pages/auth/VerifyError';
import VerifyCancel from 'pages/auth/VerifyCancel';
import Users from 'pages/profile/Users';
import PublicProfile from 'pages/profile/PublicProfile';
import PrivateProfile from 'pages/profile/PrivateProfile';
import DM from 'pages/chat/DM';
>>>>>>> parent of 6076e3e ([Frontend] Connect to backend (#94))
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
      { index: true, element: <Home /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'login', element: <LogIn /> },
      { path: 'reset-pwd', element: <ResetPassword /> },
      { path: 'reset-pwd2', element: <ResetPasswordSecond /> },
      { path: 'verify-success', element: <VerifySuccess /> },
      { path: 'verify-error', element: <VerifyError /> },
      { path: 'verify-cancel', element: <VerifyCancel /> },
      { path: 'profile', element: <Profile /> },
      { path: 'play', element: <Play /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;