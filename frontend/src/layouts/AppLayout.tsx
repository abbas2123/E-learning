import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../features/Home/componets/header";
import FooterSection from "../features/Home/sections/FooterSection";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { isLoggedIn, user } = useAuth();

  // If logged in user is an admin, redirect them away from student pages to admin dashboard
  if (isLoggedIn && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <Navbar />
      </header>

      {/* Page content */}
      <main className="w-full flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
