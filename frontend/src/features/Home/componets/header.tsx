import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import {
  Search,
  Heart,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import { SearchModal } from "../../../components/SearchModal";
import { Avatar } from "../../../components/ui/Avatar";
import { NotificationPopover } from "../../notifications/components/NotificationPopover";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const guestNavItems = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/course" },
    { name: "Categories", href: "/categories" },
  ];

  const studentNavItems = [
    { name: "Home", href: "/" },
    { name: "Explore Courses", href: "/course" },
    { name: "My Learning", href: "/my-learning" },
  ];

  const navItems = isLoggedIn ? studentNavItems : guestNavItems;

  const handleLogout = () => {
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
    logout();
    toast.success("Signed out successfully 👋");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="relative w-full border-b border-white/10 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <BookOpen size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              TOTC
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-semibold transition hover:text-indigo-400 ${
                    isActive ? "text-indigo-400" : "text-slate-300"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Search courses...</span>
            </button>

            {isLoggedIn && user ? (
              <div className="flex items-center gap-2">
                {/* Wishlist Link */}
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800 hover:text-rose-400"
                  title="Wishlist"
                >
                  <Heart size={18} />
                </button>

                {/* Notifications Popover */}
                <NotificationPopover />

                {/* Profile Dropdown */}
                <div className="relative ml-1">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-800"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <span className="hidden text-xs font-semibold text-slate-200 lg:block">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 bg-white p-2 text-slate-800 shadow-2xl z-50">
                      <div className="border-b border-slate-100 p-3">
                        <p className="font-bold text-sm text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                        <span className="mt-2 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/profile");
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon size={15} />
                          My Profile
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/my-learning");
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <BookOpen size={15} />
                          My Learning
                        </button>

                        {(user.role === "instructor" || user.role === "admin") && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              navigate("/instructor/dashboard");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                          >
                            <LayoutDashboard size={15} />
                            Instructor Studio
                          </button>
                        )}

                        {user.role === "admin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              navigate("/admin/dashboard");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50"
                          >
                            <LayoutDashboard size={15} />
                            Admin Panel
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-200 transition hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-800 bg-slate-900 px-4 py-5 md:hidden">
            <div className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}

              {!isLoggedIn && (
                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl border border-slate-700 py-2.5 text-xs font-bold text-slate-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
