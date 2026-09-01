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
 * Protects routes that require admin role.
 * Unauthenticated → /admin/login (replace)
 * Non-admin authenticated → / (replace)
 */
const AdminProtectedRoute = () => {
  const { user, isLoggedIn, isInitializing } = useAuth();

  if (isInitializing) return <AuthLoadingSpinner />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
