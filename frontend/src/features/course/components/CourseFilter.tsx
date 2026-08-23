import { useEffect, useState } from "react";
import { adminService } from "../../admin/services/adminService";
import { Filter, RotateCcw } from "lucide-react";

interface CourseFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  selectedPrice: string;
  onPriceChange: (price: string) => void;
  onReset?: () => void;
}

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const priceOptions = ["All Prices", "Free", "Paid"];

const CourseFilter = ({
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  selectedPrice,
  onPriceChange,
  onReset,
}: CourseFilterProps) => {
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    adminService
      .getCategories()
      .then((data) => {
        const fetched = data.map((c) => c.name);
        const combined = Array.from(
          new Set(["All", ...fetched, "Web Development", "Frontend", "Backend", "Database"]),
        );
        setCategories(combined);
      })
      .catch(() => {
        setCategories(["All", "Web Development", "Frontend", "Backend", "Database"]);
      });
  }, []);

  const isFiltered =
    selectedCategory !== "All" ||
    selectedLevel !== "All Levels" ||
    selectedPrice !== "All Prices";

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Filter size={18} className="text-indigo-600" />
          Filter Courses
        </div>

        {isFiltered && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline"
          >
            <RotateCcw size={13} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level & Price Dropdowns */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-3 border-t border-slate-100">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Difficulty Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Pricing
          </label>
          <select
            value={selectedPrice}
            onChange={(e) => onPriceChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500"
          >
            {priceOptions.map((prc) => (
              <option key={prc} value={prc}>
                {prc}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CourseFilter;
