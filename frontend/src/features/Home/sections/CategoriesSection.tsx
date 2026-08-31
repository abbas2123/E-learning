import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService, type CategoryItem } from "../../../services/categoryService";
import { Skeleton } from "../../../components/ui/Skeleton";
import { LayoutGrid, ArrowRight } from "lucide-react";

export default function CategoriesSection() {
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
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Top Categories
            </p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Explore Popular Subjects
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            All Categories
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
            No categories available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/course?category=${encodeURIComponent(cat.name)}`)}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <LayoutGrid size={22} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800 line-clamp-1">
                  {cat.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {cat.coursesCount ?? 0} courses
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
