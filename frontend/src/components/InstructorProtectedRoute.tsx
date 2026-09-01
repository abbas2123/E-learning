import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    </div>
  );
}

/**
 * Protects routes that require instructor or admin role.
 * Unauthenticated → /instructor/login (replace)
 * Wrong role → / (replace)
 */
const InstructorProtectedRoute = () => {
  const { user, isLoggedIn, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <AuthLoadingSpinner />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/instructor/login" state={{ from: location }} replace />;
  }

  if (user.role !== "instructor" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default InstructorProtectedRoute;
