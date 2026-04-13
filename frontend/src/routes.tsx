import Layout from 'App';
import Home from 'pages/Home';
import SignUp from 'pages/todo/SignUp';
import LogIn from 'pages/todo/LogIn';
import ResetPassword from 'pages/todo/ResetPassword';
import ResetPasswordSecond from 'pages/todo/ResetPassword2';
import VerifyError from 'pages/todo/VerifyError';
import VerifySuccess from 'pages/todo/VerifySuccess';
import Profile from 'pages/todo/Profile';
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
      { path: 'profile', element: <Profile /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;
