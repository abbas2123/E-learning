import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { PlayCircle, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";

export type ActiveStudentCourse = {
  id: string;
  title: string;
  category: string;
  progress: number;
  modulesCompleted: string;
  instructor: string;
  image: string;
  nextLesson: string;
  lastLessonId?: string;
};

type UserDashboardWidgetsProps = {
  activeCourses?: ActiveStudentCourse[];
  loading?: boolean;
};

export default function UserDashboardWidgets({ activeCourses, loading }: UserDashboardWidgetsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name ? user.name.split(" ")[0] : "Your";

  const coursesList = activeCourses ?? [];

  return (
    <section id="dashboard" className="py-16 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-10">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Personalized Learning
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {userName}'s Active Courses
            </h2>
          </div>
          {coursesList.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/my-learning")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition"
            >
              View All Enrolled Courses ({coursesList.length})
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[24px] bg-white p-5 border border-slate-200 shadow-sm space-y-4">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : coursesList.length === 0 ? (
          /* Empty State */
          <div className="rounded-[28px] bg-white p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <BookOpen size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Enrolled Courses Yet</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You haven't enrolled in any courses yet. Browse our course catalog to find your next skill!
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/course")}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-teal-600 text-white px-5 py-2.5 text-xs font-bold shadow-md transition"
            >
              Explore Course Catalog
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* Real Enrolled Courses Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesList.map((course) => (
              <div
                key={course.id}
                className="group rounded-[24px] bg-white p-5 border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Course Image Header */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-4 bg-slate-100">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      {course.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-extrabold px-2.5 py-1 rounded-full border border-slate-200">
                      {course.progress}% Complete
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 min-h-[48px]">
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
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Lesson info */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800">Next: </span>
                      <span className="line-clamp-1">{course.nextLesson}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/learn/${course.id}`)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <PlayCircle size={15} />
                  {course.progress === 100 ? "Review Course" : "Continue Lesson"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
