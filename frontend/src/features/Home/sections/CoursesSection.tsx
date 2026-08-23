import CourseCard from "../componets/CourseCard";

export type CourseItem = {
  id: string;
  title: string;
  description: string;
  label?: string;
  accent?: string;
};

type CoursesSectionProps = {
  badgeText?: string;
  title?: string;
  description?: string;
  courses?: CourseItem[];
};

export default function CoursesSection({
  badgeText = "Explore Courses",
  title = "Courses crafted to help you launch your career.",
  description = "Choose a path that matches your goals, then learn with practical projects, mentor feedback, and career-focused support.",
  courses = [],
}: CoursesSectionProps) {
  return (
    <section id="courses" className="bg-slate-950 py-24 text-white">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
              {badgeText}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {title}
            </h2>
            <p className="text-lg leading-8 text-slate-300">{description}</p>
          </div>

          <div>
            {!courses || courses.length === 0 ? (
              <div className="rounded-[28px] border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400 space-y-3">
                <div className="text-4xl">📚</div>
                <h3 className="text-xl font-bold text-white">No Courses Available</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  There are currently no courses to display. Please check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    label={course.label || "Course"}
                    accent={course.accent || "bg-cyan-500/10 text-cyan-600 border-cyan-200"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
