import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  IndianRupee,
  BarChart3,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface InstructorSidebarProps {
  onCloseMobile?: () => void;
}

export function InstructorSidebar({ onCloseMobile }: InstructorSidebarProps) {
  const navItems = [
    { label: "Dashboard", path: "/instructor/dashboard", icon: LayoutDashboard },
    { label: "Courses", path: "/instructor/courses", icon: BookOpen },
    { label: "Create Course", path: "/instructor/courses/create", icon: PlusCircle },
    { label: "Students", path: "/instructor/students", icon: Users },
    { label: "Revenue", path: "/instructor/revenue", icon: IndianRupee },
    { label: "Analytics", path: "/instructor/analytics", icon: BarChart3 },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <GraduationCap size={22} />
        </div>
        <div>
          <span className="text-base font-extrabold tracking-tight text-white block">TOTC Studio</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Instructor Portal</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Banner */}
      <div className="p-4 border-t border-slate-900">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-[11px] text-indigo-300">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Instructor Studio</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Build production curriculum, author quizzes, and track revenue.
          </p>
        </div>
      </div>
    </aside>
  );
}
