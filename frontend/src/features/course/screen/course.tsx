import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CourseCard, { type Course } from "../components/CourseCard";
import CourseHeader from "../components/CourseHeader";
import CourseFilter from "../components/CourseFilter";
import { getCourses } from "../service/courseService";
import { CourseCardSkeletonGrid } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ArrowUpDown } from "lucide-react";

const CourseScreen = () => {
  const [searchParams] = useSearchParams();
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">(
    "newest",
  );

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAllCourses() {
      try {
        const data = await getCourses();
        setCoursesList(data || []);
      } catch (err) {
        console.error("Failed to load courses from backend", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllCourses();
  }, []);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedLevel("All Levels");
    setSelectedPrice("All Prices");
    setSortBy("newest");
  };

  const filteredCourses = useMemo(() => {
    let result = coursesList.filter((course) => {
      // Search
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        (course.description &&
          course.description.toLowerCase().includes(search.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === "All" ||
        course.category.toLowerCase() === selectedCategory.toLowerCase();

      // Level
      const matchesLevel =
        selectedLevel === "All Levels" ||
        (course.level &&
          course.level.toLowerCase() === selectedLevel.toLowerCase());

      // Price
      const matchesPrice =
        selectedPrice === "All Prices" ||
        (selectedPrice === "Free" && course.price === 0) ||
        (selectedPrice === "Paid" && course.price > 0);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    // Sorting
    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    coursesList,
    search,
    selectedCategory,
    selectedLevel,
    selectedPrice,
    sortBy,
  ]);

  const handleCourseClick = (course: Course) => {
    navigate(`/course/${course.id}`);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CourseHeader search={search} onSearchChange={setSearch} />

        <CourseFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedPrice={selectedPrice}
          onPriceChange={setSelectedPrice}
          onReset={resetFilters}
        />

        {/* Results Header & Sorting */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore Catalog</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredCourses.length} of {coursesList.length} total courses
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={15} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Courses Display */}
        {loading ? (
          <CourseCardSkeletonGrid count={6} />
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={handleCourseClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No courses match your filters"
            description="Try adjusting your search criteria or reset filters to browse the complete catalog."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        )}
      </div>
    </main>
  );
};

export default CourseScreen;
