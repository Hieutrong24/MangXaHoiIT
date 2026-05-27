import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';

import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { AppShellLayout } from '../layouts/AppShellLayout.jsx';

import LoginPage from '../../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../../features/auth/pages/RegisterPage.jsx';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage.jsx';
import GoogleCallbackPage from '../../features/auth/pages/GoogleCallbackPage.jsx';
import RootRedirectPage from '../../features/public/pages/RootRedirectPage.jsx';

import HomeFeedPage from '../../features/feed/pages/HomeFeedPage.jsx';
import PostListPage from '../../features/posts/pages/PostListPage.jsx';
import PostDetailPage from '../../features/posts/pages/PostDetailPage.jsx';
import PostEditorPage from '../../features/posts/pages/PostEditorPage.jsx';

import ProfilePage from '../../features/profile/pages/ProfilePage.jsx';
import EditProfilePage from '../../features/profile/pages/EditProfilePage.jsx';

import SearchPage from '../../features/search/pages/SearchPage.jsx';
import NotificationsPage from '../../features/notifications/pages/NotificationsPage.jsx';
import ChatPage from '../../features/chat/pages/ChatPage.jsx';

import TagsPage from '../../features/tags/pages/TagsPage.jsx';
import TagDetailPage from '../../features/tags/pages/TagDetailPage.jsx';

import LearnHomePage from '../../features/codejudge/pages/LearnHomePage.jsx';
import PathDetailPage from '../../features/codejudge/pages/PathDetailPage.jsx';
import LessonPage from '../../features/codejudge/pages/LessonPage.jsx';
import QuizPage from '../../features/codejudge/pages/QuizPage.jsx';
import ProblemsPage from '../../features/codejudge/pages/ProblemsPage.jsx';
import ProblemDetailPage from '../../features/codejudge/pages/ProblemDetailPage.jsx';
import SubmissionPage from '../../features/codejudge/pages/SubmissionPage.jsx';

import SettingsPage from '../../features/settings/pages/SettingsPage.jsx';
import CommunityPage from '../../features/community/pages/CommunityPage.jsx';
import GroupDetailPage from '../../features/community/pages/GroupDetailPage.jsx';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <RootRedirectPage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: '/auth/login', element: <LoginPage /> },
          { path: '/auth/register', element: <RegisterPage /> },
          { path: '/auth/forgot', element: <ForgotPasswordPage /> },
          { path: '/auth/google/success', element: <GoogleCallbackPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShellLayout />,
            children: [
              { path: '/feed', element: <HomeFeedPage /> },
              { path: '/posts', element: <PostListPage /> },
              { path: '/posts/new', element: <PostEditorPage mode="create" /> },
              { path: '/posts/:id/edit', element: <PostEditorPage mode="edit" /> },
              { path: '/u/:username', element: <ProfilePage /> },
              { path: '/users/:userId', element: <ProfilePage /> },
              { path: '/me/edit', element: <EditProfilePage /> },
              { path: '/search', element: <SearchPage /> },
              { path: '/notifications', element: <NotificationsPage /> },
              { path: '/chat', element: <ChatPage /> },
              { path: '/community', element: <CommunityPage /> },
              { path: '/jobs', element: <Navigate to="/feed" replace /> },
              { path: '/tags', element: <TagsPage /> },
              { path: '/code', element: <Navigate to="/code/learn" replace /> },
              { path: '/code/learn', element: <LearnHomePage /> },
              { path: '/code/problems', element: <ProblemsPage /> },
              { path: '/settings', element: <SettingsPage /> },
            ],
          },
          {
            element: <AppShellLayout />,
            children: [
              { path: '/posts/:id', element: <PostDetailPage /> },
              { path: '/community/groups/:groupId', element: <GroupDetailPage /> },
              { path: '/tags/:slug', element: <TagDetailPage /> },
              { path: '/code/paths/:slug', element: <PathDetailPage /> },
              { path: '/code/lessons/:lessonId', element: <LessonPage /> },
              { path: '/code/quizzes/:quizId', element: <QuizPage /> },
              { path: '/code/problems/:id', element: <ProblemDetailPage /> },
              { path: '/code/submit/:id', element: <SubmissionPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <div className="min-h-screen grid place-items-center">404</div> },
    ],
  },
]);

export default router;
