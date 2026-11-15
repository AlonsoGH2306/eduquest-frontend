import React, { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Spinner } from '../components/common/Spinner';
import { Navbar } from '../components/layout/Navbar';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { PrivateRoute } from '../components/layout/PrivateRoute';
import { PublicOnlyRoute } from '../components/layout/PublicOnlyRoute';
import { MyGroupsProvider } from '../contexts/MyGroupsContext';
import { SavedDocumentsProvider } from '../contexts/SavedDocumentsContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';

const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('../pages/DashBoardPage').then((m) => ({ default: m.DashboardPage })));
const ExploreDocumentsPage = lazy(() =>
  import('../pages/ExploreDocumentsPage').then((m) => ({ default: m.ExploreDocumentsPage }))
);
const GroupsPage = lazy(() => import('../pages/GroupPage').then((m) => ({ default: m.GroupsPage })));
const GroupDetailPage = lazy(() => import('../pages/GroupDetailPage').then((m) => ({ default: m.GroupDetailPage })));
const StudyPlannerPage = lazy(() => import('../pages/StudyPlannerPage').then((m) => ({ default: m.StudyPlannerPage })));
const InvitePage = lazy(() => import('../pages/InvitePage').then((m) => ({ default: m.InvitePage })));
const AchievementsPage = lazy(() => import('../pages/AchievementsPage').then((m) => ({ default: m.AchievementsPage })));
const MessagesPage = lazy(() => import('../pages/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const AdminAnnouncementsPage = lazy(() =>
  import('../pages/AdminAnnouncementsPage').then((m) => ({ default: m.AdminAnnouncementsPage }))
);
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminReportsPage = lazy(() => import('../pages/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const BannedPage = lazy(() => import('../pages/BannedPage').then((m) => ({ default: m.BannedPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const ProtectedLayout: React.FC = () => (
  <MyGroupsProvider>
    <NotificationsProvider>
      <SavedDocumentsProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <OfflineBanner />
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <Suspense fallback={<Spinner label="Cargando..." />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </SavedDocumentsProvider>
    </NotificationsProvider>
  </MyGroupsProvider>
);

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<Spinner fullScreen label="Cargando EduQuest..." />}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/banned" element={<BannedPage />} />
      <Route path="/forgot-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<ExploreDocumentsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/invite/:code" element={<InvitePage />} />
          <Route path="/study-planner" element={<StudyPlannerPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<PrivateRoute requireUserManagement />}>
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
