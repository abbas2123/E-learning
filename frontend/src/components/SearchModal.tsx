import { useState, useEffect } from "react";
import { Search, X, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../features/course/service/courseService";
import type { Course } from "../features/course/types/course.types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getCourses()
        .then(setCourses)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim()
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(query.toLowerCase())),
      )
    : courses.slice(0, 4); // Suggest top 4 when query empty

  const handleSelectCourse = (courseId: string) => {
    onClose();
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 backdrop-blur-sm sm:pt-24">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics, or categories..."
            className="w-full bg-transparent text-base font-medium text-slate-800 placeholder-slate-400 outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center">
              <BookOpen size={32} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                No courses found for "{query}"
              </p>
              <p className="text-xs text-slate-400">
                Try searching for broader keywords like "Web", "Design", or "Data".
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {query.trim() ? "Search Results" : "Featured Courses"}
              </p>
              <div className="space-y-2">
                {results.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => handleSelectCourse(course.id)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl p-3 text-left transition hover:bg-indigo-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <BookOpen size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">
                          {course.title}
                        </p>
                        <span className="text-xs font-semibold text-indigo-600">
                          {course.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        ₹{course.price}
                      </span>
                      <ArrowRight size={16} className="text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
          <span>Press ESC to exit</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/course?search=${encodeURIComponent(query)}`);
            }}
            className="font-bold text-indigo-600 hover:underline"
          >
            View all courses
          </button>
        </div>
      </div>
    </div>
  );
}
