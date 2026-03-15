import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

import { AuthLayout } from "../layouts/AuthLayout.jsx";
import { MainLayout } from "../layouts/MainLayout.jsx";

import LoginPage from "../../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../../features/auth/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage.jsx";

import HomeFeedPage from "../../features/feed/pages/HomeFeedPage.jsx";
import PostListPage from "../../features/posts/pages/PostListPage.jsx";
import PostDetailPage from "../../features/posts/pages/PostDetailPage.jsx";
import PostEditorPage from "../../features/posts/pages/PostEditorPage.jsx";

import ProfilePage from "../../features/profile/pages/ProfilePage.jsx";
import EditProfilePage from "../../features/profile/pages/EditProfilePage.jsx";

import SearchPage from "../../features/search/pages/SearchPage.jsx";
import NotificationsPage from "../../features/notifications/pages/NotificationsPage.jsx";

import ChatPage from "../../features/chat/pages/ChatPage.jsx";

import TagsPage from "../../features/tags/pages/TagsPage.jsx";
import TagDetailPage from "../../features/tags/pages/TagDetailPage.jsx";

import ProblemsPage from "../../features/codejudge/pages/ProblemsPage.jsx";
import ProblemDetailPage from "../../features/codejudge/pages/ProblemDetailPage.jsx";
import SubmissionPage from "../../features/codejudge/pages/SubmissionPage.jsx";

import SettingsPage from "../../features/settings/pages/SettingsPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/feed" element={<HomeFeedPage />} />

          <Route path="/posts" element={<PostListPage />} />
          <Route path="/posts/new" element={<PostEditorPage mode="create" />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/posts/:id/edit" element={<PostEditorPage mode="edit" />} />

          <Route path="/u/:username" element={<ProfilePage />} />
            <Route path="/users/:userId" element={<ProfilePage />} />
          <Route path="/me/edit" element={<EditProfilePage />} />

          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/chat" element={<ChatPage />} />

          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tags/:slug" element={<TagDetailPage />} />

          <Route path="/code/problems" element={<ProblemsPage />} />
          <Route path="/code/problems/:id" element={<ProblemDetailPage />} />
          <Route path="/code/submit/:id" element={<SubmissionPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="min-h-screen grid place-items-center">404</div>} />
    </Routes>
  );
}
