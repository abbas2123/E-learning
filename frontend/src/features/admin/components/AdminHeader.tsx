import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import QuickSearchModal from "./QuickSearchModal";
import NotificationDrawer from "./NotificationDrawer";
import { useAuth } from "../../../context/AuthContext";

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/courses/create")) return { title: "Create Course", subtitle: "Build & publish a new course" };
    if (path.includes("/courses/pending")) return { title: "Pending Approvals", subtitle: "Review course submissions" };
    if (path.includes("/courses")) return { title: "Course Catalog", subtitle: "Manage platform courses" };
    if (path.includes("/categories")) return { title: "Categories", subtitle: "Course categories & tags" };
    if (path.includes("/students")) return { title: "Students Roster", subtitle: "Enrolled student directory" };
    if (path.includes("/instructors")) return { title: "Instructors", subtitle: "Instructor applications & courses" };
    if (path.includes("/users")) return { title: "Users Roster", subtitle: "Manage user roles & access" };
    if (path.includes("/enrollments")) return { title: "Enrollment Logs", subtitle: "Student purchases & course activity" };
    if (path.includes("/analytics")) return { title: "Platform Analytics", subtitle: "Performance metrics & reports" };
    if (path.includes("/revenue")) return { title: "Revenue & Earnings", subtitle: "Financial reports & payouts" };
    if (path.includes("/notifications")) return { title: "Notifications", subtitle: "System alerts & reviews" };
    if (path.includes("/settings")) return { title: "Platform Settings", subtitle: "System configuration & options" };
    return { title: "Dashboard Overview", subtitle: "Welcome to TOTC Admin Panel" };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <>
      <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              <p className="hidden sm:block text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>

          {/* Right: Quick Search, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {/* Command K Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 border border-slate-200 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium">Search...</span>
              <kbd className="ml-3 text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400 font-semibold shadow-xs">
                ⌘ K
              </kbd>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium capitalize">
                  {user?.role || "Administrator"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
