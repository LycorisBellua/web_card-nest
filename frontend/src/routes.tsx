import { lazy, Suspense } from 'react';
import Layout from 'App';
import Auth from 'pages/auth/Auth';
import ResetPassword from 'pages/auth/ResetPassword';
import VerifySuccess from 'pages/auth/VerifySuccess';
import VerifyError from 'pages/auth/VerifyError';
import VerifyCancel from 'pages/auth/VerifyCancel';
import Users from 'pages/profile/Users';
import PublicProfile from 'pages/profile/PublicProfile';
import PrivateProfile from 'pages/profile/PrivateProfile';
import Play from 'game/Play';
import PrivacyPolicy from 'pages/footer/PrivacyPolicy';
import TermsOfService from 'pages/footer/TermsOfService';
import Credits from 'pages/footer/Credits';
import DataExtraction from 'pages/footer/DataExtraction';
import LoadingChat from 'pages/chat/LoadingChat';
import NotFound from 'pages/NotFound';

const Lobby = lazy(() => import('pages/chat/Lobby'));
const DM = lazy(() => import('pages/chat/DM'));

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingChat isLobby={true} />}>
            <Lobby />
          </Suspense>
        ),
      },
      { path: 'auth', element: <Auth /> },
      { path: 'reset-pwd', element: <ResetPassword /> },
      { path: 'verify-success', element: <VerifySuccess /> },
      { path: 'verify-error', element: <VerifyError /> },
      { path: 'verify-cancel', element: <VerifyCancel /> },
      { path: 'users', element: <Users /> },
      { path: 'user/:username', element: <PublicProfile /> },
      { path: 'profile', element: <PrivateProfile /> },
      { path: 'chat/:username', element: <DM /> },
      {
        path: 'chat/:username',
        element: (
          <Suspense fallback={<LoadingChat isLobby={false} />}>
            <DM />
          </Suspense>
        ),
      },
      { path: 'play', element: <Play /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'credits', element: <Credits /> },
      { path: 'data-extraction', element: <DataExtraction /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;
