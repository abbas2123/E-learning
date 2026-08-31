import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService, type CategoryItem } from "../../../services/categoryService";
import { LayoutGrid, ArrowRight, BookOpen, Loader2 } from "lucide-react";

export default function CategoriesScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Browse By Category
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Explore All Subjects
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Find the right domain to boost your career. Select any category to view specialized courses.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() =>
                  navigate(`/course?category=${encodeURIComponent(cat.name)}`)
                }
                className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <LayoutGrid size={24} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                    <BookOpen size={14} />
                    {cat.coursesCount ?? 0} courses
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-indigo-600">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Master key skills in {cat.name} with guided hands-on courses.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <span>Browse Courses</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
