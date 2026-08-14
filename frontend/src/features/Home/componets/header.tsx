import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const guestNavItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "#courses" },
  { name: "Careers", href: "#!" },
  { name: "Blog", href: "#!" },
  { name: "About Us", href: "#about" },
];

const userNavItems = [
  { name: "Dashboard", href: "#dashboard" },
  { name: "My Courses", href: "/course" },
  { name: "Live Classes", href: "#live-class" },
  { name: "Gradebook", href: "#gradebook" },
  { name: "Discussions", href: "#discussions" },
];

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentNavItems = isLoggedIn ? userNavItems : guestNavItems;
  const navigate = useNavigate();
  return (
    <div className="relative flex w-full items-center justify-between gap-6 px-6 py-6 lg:px-12 lg:gap-6">
      {/* Brand Logo */}
      <Link to="/" className="inline-flex items-center gap-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/10 ring-1 ring-white/20 shadow-inner">
          <img src="/image.png" alt="TOTC logo" className="h-6 w-6" />
        </div>
        <span className="text-lg font-bold tracking-tight">TOTC</span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden flex-1 justify-center gap-8 text-sm font-medium text-white/90 lg:flex">
        {currentNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="transition hover:text-white hover:scale-105"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User Controls / Auth Buttons */}
      <div className="flex items-center gap-3">
        {isLoggedIn && user ? (
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-ping" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>

            {/* Profile Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 rounded-full bg-white/10 p-1.5 pr-3 hover:bg-white/20 ring-1 ring-white/20 transition-all"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-white/40"
                />
                <span className="text-sm font-semibold text-white hidden sm:block">
                  {user.name}
                </span>
                <svg
                  className={`w-4 h-4 text-white/70 transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 text-slate-800 z-50 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full cursor-pointer text-left p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-bold text-sm text-slate-900">
                      {user.name}
                    </p>

                    <p className="text-xs text-slate-500">{user.email}</p>

                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                      {user.role} • GPA {user.gpa}
                    </span>
                  </button>

                  <div className="py-1">
                    <a
                      href="#dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Dashboard Overview
                    </a>
                    <a
                      href="#gradebook"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Gradebook & Analytics
                    </a>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        toast.success("Signed out successfully", {
                          description: "See you next time! 👋",
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 shadow-md"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
