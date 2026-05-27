import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AdminWorkspaceLayout from '../layouts/AdminWorkspaceLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import LoginPage from '../../features/auth/pages/LoginPage.jsx';
import DashboardOverviewPage from '../../features/dashboard/pages/DashboardOverviewPage.jsx';
import ContentDashboardPage from '../../features/dashboard/pages/ContentDashboardPage.jsx';
import PostsModerationPage from '../../features/dashboard/pages/PostsModerationPage.jsx';
import CommentsModerationPage from '../../features/dashboard/pages/CommentsModerationPage.jsx';
import GroupsModerationPage from '../../features/dashboard/pages/GroupsModerationPage.jsx';
import ChatOperationsPage from '../../features/dashboard/pages/ChatOperationsPage.jsx';
import NotificationsPage from '../../features/dashboard/pages/NotificationsPage.jsx';
import LearningDashboardPage from '../../features/dashboard/pages/LearningDashboardPage.jsx';
import LearningCatalogPage from '../../features/dashboard/pages/LearningCatalogPage.jsx';
import UsersPage from '../../features/users/pages/UsersPage.jsx';
import UserDetailPage from '../../features/users/pages/UserDetailPage.jsx';
import UserActivityPage from '../../features/users/pages/UserActivityPage.jsx';
import SecurityAccountsPage from '../../features/users/pages/SecurityAccountsPage.jsx';
import SecurityAuditPage from '../../features/users/pages/SecurityAuditPage.jsx';
import JobsPage from '../../features/jobs/pages/JobsPage.jsx';
import JobsDashboardPage from '../../features/jobs/pages/JobsDashboardPage.jsx';
import JobEditorPage from '../../features/jobs/pages/JobEditorPage.jsx';
import JobDetailPage from '../../features/jobs/pages/JobDetailPage.jsx';
import JobApplicationsPage from '../../features/jobs/pages/JobApplicationsPage.jsx';
import ProblemsPage from '../../features/code/pages/ProblemsPage.jsx';
import ProblemEditorPage from '../../features/code/pages/ProblemEditorPage.jsx';
import ProblemDetailPage from '../../features/code/pages/ProblemDetailPage.jsx';
import SubmissionsPage from '../../features/code/pages/SubmissionsPage.jsx';
import SubmissionDetailPage from '../../features/code/pages/SubmissionDetailPage.jsx';

const router = createBrowserRouter([
  {
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/auth/login', element: <LoginPage /> },
        ],
      },
      {
        element: <ProtectedRoute requireAdmin />,
        children: [
          {
            element: <AdminWorkspaceLayout />,
            children: [
              { path: '/', element: <DashboardOverviewPage /> },
              { path: '/users', element: <UsersPage /> },
              { path: '/users/activity', element: <UserActivityPage /> },
              { path: '/users/:userId', element: <UserDetailPage /> },
              { path: '/security/accounts', element: <SecurityAccountsPage /> },
              { path: '/security/audit', element: <SecurityAuditPage /> },
              { path: '/content/dashboard', element: <ContentDashboardPage /> },
              { path: '/content/posts', element: <PostsModerationPage /> },
              { path: '/content/comments', element: <CommentsModerationPage /> },
              { path: '/content/groups', element: <GroupsModerationPage /> },
              { path: '/communication/chat', element: <ChatOperationsPage /> },
              { path: '/communication/notifications', element: <NotificationsPage /> },
              { path: '/jobs', element: <JobsPage /> },
              { path: '/jobs/new', element: <JobEditorPage mode="create" /> },
              { path: '/jobs/dashboard', element: <JobsDashboardPage /> },
              { path: '/jobs/:jobId', element: <JobDetailPage /> },
              { path: '/jobs/:jobId/edit', element: <JobEditorPage mode="edit" /> },
              { path: '/jobs/:jobId/applications', element: <JobApplicationsPage /> },
              { path: '/learning/dashboard', element: <LearningDashboardPage /> },
              { path: '/learning/catalog', element: <LearningCatalogPage /> },
              { path: '/code/problems', element: <ProblemsPage /> },
              { path: '/code/problems/new', element: <ProblemEditorPage mode="create" /> },
              { path: '/code/problems/:problemId', element: <ProblemDetailPage /> },
              { path: '/code/problems/:problemId/edit', element: <ProblemEditorPage mode="edit" /> },
              { path: '/code/submissions', element: <SubmissionsPage /> },
              { path: '/code/submissions/:submissionId', element: <SubmissionDetailPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
