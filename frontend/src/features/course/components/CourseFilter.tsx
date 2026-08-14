interface CourseFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  "All",
  "Web Development",
  "Frontend",
  "Backend",
  "Database",
  "Programming",
];

const CourseFilter = ({
  selectedCategory,
  onCategoryChange,
}: CourseFilterProps) => {
  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const active = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CourseFilter;
