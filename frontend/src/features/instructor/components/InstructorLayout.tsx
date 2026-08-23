import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { InstructorSidebar } from "./InstructorSidebar";
import { useAuth } from "../../../context/AuthContext";
import { Menu, X, ArrowLeft, LogOut, User as UserIcon } from "lucide-react";

export function InstructorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <InstructorSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <InstructorSidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-400 transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Student Site</span>
            </Link>
          </div>

          {/* User Right Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-indigo-500/50 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-white">{user?.name}</span>
                <span className="block text-[10px] font-medium text-slate-400 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign Out"
              className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:border-slate-700 hover:text-rose-400 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default InstructorLayout;
