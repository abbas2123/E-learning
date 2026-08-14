import { Clock, BookOpen, ArrowRight } from "lucide-react";

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  lessons: number;
  price: number;
  originalPrice?: number;
}

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <div
      onClick={() => onClick?.(course)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Level */}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {course.level}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {course.category}
        </p>

        {/* Title */}
        <h3 className="line-clamp-2 min-h-[56px] text-lg font-bold leading-7 text-slate-900 transition-colors group-hover:text-indigo-600">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.description}
        </p>

        {/* Course stats */}
        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span>{course.duration} hours</span>
          </div>

          <div className="flex items-center gap-1.5">
            <BookOpen size={16} />
            <span>{course.lessons} lessons</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">
              ₹{course.price.toLocaleString("en-IN")}
            </span>

            {course.originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                ₹{course.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition-all duration-300 group-hover:bg-indigo-600">
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
