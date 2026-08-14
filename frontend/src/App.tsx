import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetailsScreen from "./features/course/screen/CourseDetailsScreen";

const HomePage = lazy(() => import("./features/Home/screens/HomePage"));

const Login = lazy(() => import("./features/Auth/screens/Login"));

const Register = lazy(() => import("./features/Auth/screens/Register"));

const VerifyOtp = lazy(() => import("./features/Auth/screens/VerifyOtp"));
const Course = lazy(() => import("./features/course/screen/course"));

const ForgotPassword = lazy(
  () => import("./features/Auth/screens/ForgotPassword"),
);

const ResetPassword = lazy(
  () => import("./features/Auth/screens/ResetPassword"),
);
const Profile = lazy(() => import("./features/Profile/screen/Profile"));
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Main App Layout */}
        <Route element={<AppLayout />}>
          {/* Home Page — Accessible to guests & logged-in users */}
          <Route path="/" element={<HomePage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Protected routes here */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/course" element={<Course />} />
            <Route path="/course/:courseId" element={<CourseDetailsScreen />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
