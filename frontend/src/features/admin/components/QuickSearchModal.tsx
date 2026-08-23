import { useState, useEffect } from "react";
import { Search, X, BookOpen, Users, LayoutDashboard, DollarSign, Settings, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: "Overview Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, category: "Navigation" },
    { label: "All Courses Catalog", path: "/admin/courses", icon: BookOpen, category: "Navigation" },
    { label: "Create New Course", path: "/admin/courses/create", icon: BookOpen, category: "Actions" },
    { label: "Course Categories", path: "/admin/categories", icon: BookOpen, category: "Navigation" },
    { label: "Pending Approvals", path: "/admin/courses/pending", icon: BookOpen, category: "Actions" },
    { label: "All Platform Users", path: "/admin/users", icon: Users, category: "Navigation" },
    { label: "Students List", path: "/admin/students", icon: Users, category: "Navigation" },
    { label: "Instructors Management", path: "/admin/instructors", icon: Users, category: "Navigation" },
    { label: "Revenue & Earnings", path: "/admin/revenue", icon: DollarSign, category: "Analytics" },
    { label: "System Settings", path: "/admin/settings", icon: Settings, category: "Configuration" },
  ];

  const filteredLinks = query.trim()
    ? quickLinks.filter((link) =>
        link.label.toLowerCase().includes(query.toLowerCase()) ||
        link.category.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search page..."
            className="w-full h-14 px-4 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-semibold">
            ESC
          </span>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filteredLinks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching admin pages or actions found for "{query}".
            </div>
          ) : (
            filteredLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4 text-slate-600 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono">⌘ K</kbd> to open search anytime</span>
          <span>TOTC Admin System</span>
        </div>
      </div>
    </div>
  );
}
