import { Navigate } from "react-router-dom";
import Spinner from "../../../shared/components/Spinner";
import { useAuth } from "../../auth/hooks/useAuth";
import PublicHomePage from "./PublicHomePage";

export default function RootRedirectPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/feed" replace /> : <PublicHomePage />;
}
