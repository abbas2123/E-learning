import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    </div>
  );
}

/**
 * Renders the public auth page (Login/Register/etc.) only when the user is
 * NOT authenticated. Authenticated users are immediately redirected to their
 * dashboard using `replace` so pressing Back never returns them to the auth pages.
 */
export default function PublicOnlyRoute() {
  const { isLoggedIn, user, isInitializing } = useAuth();

  // Wait for auth hydration before making routing decisions
  if (isInitializing) return <AuthLoadingSpinner />;

  if (isLoggedIn) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === "instructor") {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
