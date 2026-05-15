import { lazy, Suspense } from 'react';
import Layout from 'App';
import Home from 'pages/Home';
import SignUp from 'pages/SignUp';
import LogIn from 'pages/LogIn';
import ResetPassword from 'pages/ResetPassword';
import ResetPasswordSecond from 'pages/ResetPassword2';
import VerifySuccess from 'pages/VerifySuccess';
import VerifyError from 'pages/VerifyError';
import VerifyCancel from 'pages/VerifyCancel';
import Profile from 'pages/Profile';
import Play from 'game/Play';
import PrivacyPolicy from 'pages/PrivacyPolicy';
import TermsOfService from 'pages/TermsOfService';
import Credits from 'pages/Credits';
import NotFound from 'pages/NotFound';
// import { ChatApp } from 'pages/ChatPages';

const ChatApp = lazy(() => import('pages/ChatPage').then(m => ({ default: m.ChatApp })));

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
      { path: 'chat', element: <Suspense fallback={<div>Loading...</div>}><ChatApp /></Suspense> },
      // { path: 'chat', element: <ChatApp /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;

