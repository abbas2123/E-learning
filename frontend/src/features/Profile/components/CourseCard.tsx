interface Course {
  id: string | number;
  category: string;
  title: string;
  description: string;
  image: string;
  progress: number;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Image */}
      <div className="relative h-[100px] w-full overflow-hidden bg-gray-100">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Category */}
        <span className="inline-flex rounded-md bg-[#e9fbfb] px-2 py-1 text-[7px] font-semibold text-[#53C4C8]">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="mt-2 line-clamp-1 text-[10px] font-bold text-[#252a43]">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 line-clamp-2 min-h-[25px] text-[7px] leading-relaxed text-gray-400">
          {course.description}
        </p>

        {/* Progress */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[7px] text-gray-400">Progress</span>

            <span className="text-[7px] font-semibold text-gray-400">
              {course.progress}%
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#53C4C8] transition-all"
              style={{
                width: `${course.progress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
