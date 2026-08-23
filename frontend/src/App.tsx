import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/adminLayout/adminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
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

// Student & Public Pages
const MyLearningScreen = lazy(
  () => import("./features/learning/screens/MyLearningScreen"),
);
const LearningPlayerScreen = lazy(
  () => import("./features/learning/screens/LearningPlayerScreen"),
);
const StudentNotificationsScreen = lazy(
  () => import("./features/notifications/screens/NotificationsScreen"),
);
const PublicCategoriesScreen = lazy(
  () => import("./features/courses/screens/CategoriesScreen"),
);
const CartScreen = lazy(() => import("./features/cart/screens/CartScreen"));
const CheckoutScreen = lazy(
  () => import("./features/cart/screens/CheckoutScreen"),
);
const InstructorComingSoonScreen = lazy(
  () => import("./features/instructor/screens/InstructorComingSoonScreen"),
);
const CertificatesPage = lazy(
  () => import("./features/Profile/screen/CertificatesPage"),
);
const CertificateVerificationScreen = lazy(
  () => import("./features/certificate/screens/CertificateVerificationScreen"),
);
const SettingsPage = lazy(
  () => import("./features/Profile/screen/SettingsPage"),
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Instructor Studio Screens
const InstructorProtectedRoute = lazy(
  () => import("./components/InstructorProtectedRoute"),
);
const InstructorLayout = lazy(
  () => import("./features/instructor/components/InstructorLayout"),
);
const InstructorDashboardScreen = lazy(
  () => import("./features/instructor/screens/InstructorDashboardScreen"),
);
const InstructorCoursesScreen = lazy(
  () => import("./features/instructor/screens/InstructorCoursesScreen"),
);
const InstructorCourseEditorScreen = lazy(
  () => import("./features/instructor/screens/InstructorCourseEditorScreen"),
);
const InstructorStudentsScreen = lazy(
  () => import("./features/instructor/screens/InstructorStudentsScreen"),
);
const InstructorRevenueScreen = lazy(
  () => import("./features/instructor/screens/InstructorRevenueScreen"),
);
const InstructorAnalyticsScreen = lazy(
  () => import("./features/instructor/screens/InstructorAnalyticsScreen"),
);

// Admin Screens
const AdminLoginScreen = lazy(
  () => import("./features/admin/auth/screens/AdminLoginScreen"),
);
const AdminDashboard = lazy(
  () => import("./features/admin/dashboard/screens/AdminDashboardScreen"),
);
const AllCoursesScreen = lazy(
  () => import("./features/admin/courses/screens/AllCoursesScreen"),
);
const CreateCourseScreen = lazy(
  () => import("./features/admin/courses/screens/CreateCourseScreen"),
);
const CategoriesScreen = lazy(
  () => import("./features/admin/courses/screens/CategoriesScreen"),
);
const PendingCoursesScreen = lazy(
  () => import("./features/admin/courses/screens/PendingCoursesScreen"),
);
const AllUsersScreen = lazy(
  () => import("./features/admin/users/screens/AllUsersScreen"),
);
const StudentsScreen = lazy(
  () => import("./features/admin/users/screens/StudentsScreen"),
);
const InstructorsScreen = lazy(
  () => import("./features/admin/users/screens/InstructorsScreen"),
);
const EnrollmentsScreen = lazy(
  () => import("./features/admin/enrollments/screens/EnrollmentsScreen"),
);
const AnalyticsScreen = lazy(
  () => import("./features/admin/analytics/screens/AnalyticsScreen"),
);
const RevenueScreen = lazy(
  () => import("./features/admin/revenue/screens/RevenueScreen"),
);
const NotificationsScreen = lazy(
  () => import("./features/admin/notifications/screens/NotificationsScreen"),
);
const SettingsScreen = lazy(
  () => import("./features/admin/settings/screens/SettingsScreen"),
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLoginScreen />} />
        </Route>

        {/* Main App Layout (Student & Guest pages) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/course" element={<Course />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/course/:courseId" element={<CourseDetailsScreen />} />
          <Route path="/courses/:courseId" element={<CourseDetailsScreen />} />
          <Route path="/categories" element={<PublicCategoriesScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/instructor/apply" element={<InstructorComingSoonScreen />} />
          <Route path="/certificates/verify" element={<CertificateVerificationScreen />} />
          <Route path="/certificates/verify/:certificateId" element={<CertificateVerificationScreen />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-learning" element={<MyLearningScreen />} />
            <Route path="/checkout" element={<CheckoutScreen />} />
            <Route path="/notifications" element={<StudentNotificationsScreen />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Learning Player (Fullscreen workspace without app header) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/learn/:courseId" element={<LearningPlayerScreen />} />
        </Route>

        {/* Instructor Studio Routes */}
        <Route element={<InstructorProtectedRoute />}>
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Navigate to="/instructor/dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboardScreen />} />
            <Route path="courses" element={<InstructorCoursesScreen />} />
            <Route path="courses/create" element={<InstructorCourseEditorScreen />} />
            <Route path="courses/:courseId/edit" element={<InstructorCourseEditorScreen />} />
            <Route path="students" element={<InstructorStudentsScreen />} />
            <Route path="revenue" element={<InstructorRevenueScreen />} />
            <Route path="analytics" element={<InstructorAnalyticsScreen />} />
          </Route>
        </Route>

        {/* Admin Dashboard Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="courses" element={<AllCoursesScreen />} />
            <Route path="courses/create" element={<CreateCourseScreen />} />
            <Route path="categories" element={<CategoriesScreen />} />
            <Route path="courses/pending" element={<PendingCoursesScreen />} />
            <Route path="users" element={<AllUsersScreen />} />
            <Route path="students" element={<StudentsScreen />} />
            <Route path="instructors" element={<InstructorsScreen />} />
            <Route path="enrollments" element={<EnrollmentsScreen />} />
            <Route path="analytics" element={<AnalyticsScreen />} />
            <Route path="revenue" element={<RevenueScreen />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
