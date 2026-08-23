import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, PlayCircle, Clock } from "lucide-react";
import { dashboardService } from "../../../services/dashboardService";
import type { ActiveStudentCourse } from "../../Home/components/UserDashboardWidgets";
import progressService from "../../../services/progressService";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { CourseCardSkeletonGrid } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";

interface EnrolledCourseWithRealProgress extends ActiveStudentCourse {
  realProgress: number;
}

export default function MyLearningScreen() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourseWithRealProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");

  useEffect(() => {
    async function loadEnrolledCourses() {
      try {
        const rawCourses = await dashboardService.getActiveCourses();
        const list = rawCourses || [];

        // Fetch real progress from backend progressService for each course
        const enriched = await Promise.all(
          list.map(async (c) => {
            try {
              const summary = await progressService.getCourseProgress(c.id);
              return { ...c, realProgress: summary.progressPercentage };
            } catch {
              return { ...c, realProgress: c.progress || 0 };
            }
          }),
        );

        setCourses(enriched);
      } catch (err) {
        console.error("Failed to load enrolled courses", err);
      } finally {
        setLoading(false);
      }
    }

    loadEnrolledCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (activeTab === "in-progress") return c.realProgress < 100;
    if (activeTab === "completed") return c.realProgress >= 100;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My Learning
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your course progress and pick up right where you left off.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "All Courses", count: courses.length },
            {
              id: "in-progress",
              label: "In Progress",
              count: courses.filter((c) => c.realProgress < 100).length,
            },
            {
              id: "completed",
              label: "Completed",
              count: courses.filter((c) => c.realProgress >= 100).length,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isActive
                      ? "bg-slate-700 text-slate-200"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <CourseCardSkeletonGrid count={3} />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              activeTab === "completed"
                ? "No completed courses yet"
                : "No enrolled courses"
            }
            description="Explore our course catalog and start your learning journey today."
            actionLabel="Explore Courses"
            onAction={() => navigate("/course")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-800 backdrop-blur-sm">
                    {course.category}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="line-clamp-2 font-bold text-slate-900 group-hover:text-indigo-600">
                    {course.title}
                  </h3>

                  <div className="mt-4">
                    <ProgressBar progress={course.realProgress} showLabel size="md" />
                  </div>

                  <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    Next: <span className="font-semibold text-slate-700">{course.nextLesson || "Lecture 1"}</span>
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                    >
                      <PlayCircle size={15} />
                      {course.realProgress === 0
                        ? "Start Course"
                        : course.realProgress === 100
                          ? "Review"
                          : "Resume"}
                    </button>

                    {course.realProgress === 100 && (
                      <button
                        type="button"
                        onClick={() => navigate("/certificates")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
