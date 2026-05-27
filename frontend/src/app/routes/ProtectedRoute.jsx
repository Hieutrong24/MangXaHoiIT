import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Spinner from "../../shared/components/Spinner";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isLoading || isAuthenticated || typeof window === "undefined") return;

    window.sessionStorage.setItem(
      "auth:flash",
      JSON.stringify({
        type: "info",
        message: "Bạn cần đăng nhập để sử dụng chức năng này.",
      })
    );
  }, [isAuthenticated, isLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <Spinner label="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
}
