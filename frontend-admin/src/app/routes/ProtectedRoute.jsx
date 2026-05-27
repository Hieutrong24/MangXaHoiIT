import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.jsx';

export default function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="screen-center"><div className="loader" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  const roleKnown = Array.isArray(user?.roles) && user.roles.length > 0;

  if (requireAdmin && roleKnown && !(hasRole('admin') || hasRole('super-admin'))) {
    return (
      <div className="screen-center">
        <div className="card card-narrow">
          <h2>Không có quyền truy cập</h2>
          <p className="muted">Tài khoản hiện tại không có vai trò admin. Hãy đăng nhập bằng tài khoản quản trị.</p>
          <div className="meta-chip">User: {user?.email || user?.username || user?.id || 'Unknown'}</div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
