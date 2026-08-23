import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserRoundCog,
  GraduationCap,
  BarChart3,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  PlusCircle,
  FolderTree,
  Clock,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface AdminSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
}

export default function AdminSidebar({ isOpen = true, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();
  const isCoursesActive = location.pathname.includes("/admin/courses") || location.pathname.includes("/admin/categories");
  const isUsersActive = location.pathname.includes("/admin/users") || location.pathname.includes("/admin/students") || location.pathname.includes("/admin/instructors");

  const [coursesOpen, setCoursesOpen] = useState(isCoursesActive);
  const [usersOpen, setUsersOpen] = useState(isUsersActive);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const subMenuItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700 font-semibold"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && setIsOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-white border-r border-slate-200
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">TOTC Learn</h1>
              <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider">
                Admin Console
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 scrollbar-thin">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>

          {/* Dashboard */}
          <NavLink to="/admin/dashboard" className={menuItemClass}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          {/* Courses Menu */}
          <div>
            <button
              onClick={() => setCoursesOpen(!coursesOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isCoursesActive && !coursesOpen
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>Courses</span>
              </div>
              {coursesOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {coursesOpen && (
              <div className="ml-5 pl-3 mt-1 border-l-2 border-slate-100 space-y-1">
                <NavLink to="/admin/courses" end className={subMenuItemClass}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>All Courses</span>
                </NavLink>

                <NavLink to="/admin/courses/create" className={subMenuItemClass}>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Course</span>
                </NavLink>

                <NavLink to="/admin/categories" className={subMenuItemClass}>
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Categories</span>
                </NavLink>

                <NavLink to="/admin/courses/pending" className={subMenuItemClass}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Approvals</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Users Menu */}
          <div>
            <button
              onClick={() => setUsersOpen(!usersOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isUsersActive && !usersOpen
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </div>
              {usersOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {usersOpen && (
              <div className="ml-5 pl-3 mt-1 border-l-2 border-slate-100 space-y-1">
                <NavLink to="/admin/users" end className={subMenuItemClass}>
                  <Users className="w-3.5 h-3.5" />
                  <span>All Users</span>
                </NavLink>

                <NavLink to="/admin/students" className={subMenuItemClass}>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Students</span>
                </NavLink>

                <NavLink to="/admin/instructors" className={subMenuItemClass}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instructors</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Enrollments */}
          <NavLink to="/admin/enrollments" className={menuItemClass}>
            <UserRoundCog className="w-5 h-5" />
            <span>Enrollments</span>
          </NavLink>

          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-4 mb-2">
            Reports & Tools
          </p>

          {/* Analytics */}
          <NavLink to="/admin/analytics" className={menuItemClass}>
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </NavLink>

          {/* Revenue */}
          <NavLink to="/admin/revenue" className={menuItemClass}>
            <DollarSign className="w-5 h-5" />
            <span>Revenue</span>
          </NavLink>

          {/* Notifications */}
          <NavLink to="/admin/notifications" className={menuItemClass}>
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              3
            </span>
          </NavLink>

          {/* Settings */}
          <NavLink to="/admin/settings" className={menuItemClass}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Footer Admin Profile Card */}
        <div className="border-t border-slate-100 p-4 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || "admin@totc.com"}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            onClick={() => {
              logout();
              navigate("/admin/login", { replace: true });
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
