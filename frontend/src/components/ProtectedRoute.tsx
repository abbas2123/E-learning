import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Renders a full-screen spinner while auth state is being restored from localStorage */
function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    </div>
  );
}

/**
 * Protects routes that require any authenticated user.
 * Redirects unauthenticated users to /login (with `replace` so Back
 * doesn't restore the protected page after logout).
 */
type ProtectedRouteProps = {
  children?: React.ReactNode;
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isLoggedIn, isInitializing } = useAuth();

  // Wait for localStorage to be read before making any routing decision
  if (isInitializing) return <AuthLoadingSpinner />;

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
