import { lazy, Suspense } from 'react';
import Layout from 'App';
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
import Play from 'game/Play';
import PrivacyPolicy from 'pages/footer/PrivacyPolicy';
import TermsOfService from 'pages/footer/TermsOfService';
import Credits from 'pages/footer/Credits';
import DataExtraction from 'pages/footer/DataExtraction';
import NotFound from 'pages/NotFound';
// import { ChatApp } from 'pages/ChatPages';

const ChatApp = lazy(() => import('pages/ChatPages').then(m => ({ default: m.ChatApp })));

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
      { path: 'verify-cancel', element: <VerifyCancel /> },
      { path: 'users', element: <Users /> },
      { path: 'user/:username', element: <PublicProfile /> },
      { path: 'profile', element: <PrivateProfile /> },
      { path: 'chat/:username', element: <DM /> },
      { path: 'play', element: <Play /> },
      { path: 'chat', element: <Suspense fallback={<div>Loading...</div>}><ChatApp /></Suspense> },
      // { path: 'chat', element: <ChatApp /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: 'data-extraction', element: <DataExtraction /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;

