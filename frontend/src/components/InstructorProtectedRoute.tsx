import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const InstructorProtectedRoute = () => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn || !user) {
    return <Navigate to="/instructor/login" state={{ from: location }} replace />;
  }

  if (user.role !== "instructor" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default InstructorProtectedRoute;
