import { Search } from "lucide-react";

interface CourseHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const CourseHeader = ({ search, onSearchChange }: CourseHeaderProps) => {
  return (
    <section className="mb-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Explore Courses
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Learn something new
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Build practical skills with structured courses designed to help you
            learn, practice, and grow.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>
    </section>
  );
};

export default CourseHeader;
