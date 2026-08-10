import { useAuth } from "../../../context/AuthContext";

export type ActiveStudentCourse = {
  id: string;
  title: string;
  category: string;
  progress: number;
  modulesCompleted: string;
  instructor: string;
  image: string;
  nextLesson: string;
};

type UserDashboardWidgetsProps = {
  activeCourses?: ActiveStudentCourse[];
};

export default function UserDashboardWidgets({ activeCourses }: UserDashboardWidgetsProps) {
  const { user } = useAuth();
  const userName = user?.name ? `${user.name}'s` : "Your";

  // Use passed courses or empty fallback
  const coursesList = activeCourses ?? []

  const totalCourses = user?.enrolledCount ?? coursesList.length;

  return (
    <section id="dashboard" className="py-16 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
              Personalized Dashboard
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {userName} Active Learning Progress
            </h2>
          </div>
          <a
            href="#my-courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition"
          >
            View All Enrolled Courses ({totalCourses}) →
          </a>
        </div>

        {/* Active Courses Grid / Empty State */}
        {!coursesList || coursesList.length === 0 ? (
          <div className="rounded-[28px] bg-white p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="text-4xl">🎓</div>
            <h3 className="text-xl font-bold text-slate-900">No Enrolled Courses Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You haven't enrolled in any active courses yet. Browse our course catalog to start learning!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesList.map((course) => (
              <div
                key={course.id}
                className="group rounded-[24px] bg-white p-5 border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Course Image Header */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-4">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      {course.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-extrabold px-2.5 py-1 rounded-full border border-slate-200">
                      {course.progress}% Complete
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Instructor: {course.instructor}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Progress</span>
                      <span>{course.modulesCompleted}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Next: </span>
                    {course.nextLesson}
                  </div>
                </div>

                <button className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md transition-all">
                  Continue Lesson
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
