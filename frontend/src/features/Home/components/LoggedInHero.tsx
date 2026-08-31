import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { PlayCircle, BookOpen, Award, Compass } from "lucide-react";
import type { DashboardSummaryResponse } from "../../../services/dashboardService";

type LoggedInHeroProps = {
  summary?: DashboardSummaryResponse;
  loading?: boolean;
};

export default function LoggedInHero({ summary, loading }: LoggedInHeroProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name ? user.name.split(" ")[0] : "Student";
  const userRole = user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : "Student";

  const enrolledCount = summary?.enrolledCount ?? 0;
  const activeCount = summary?.activeCount ?? 0;
  const certificatesCount = summary?.certificatesCount ?? 0;
  const resumeCourse = summary?.resumeCourse;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-teal-600 to-slate-900 pb-20 text-white">
      {/* Background Decorative Lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 bg-emerald-400/20 blur-3xl" />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-24">
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Personalized Greeting & Call to Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {userRole} Workspace • Active
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Welcome back, <br />
              <span className="text-cyan-300">{userName}!</span> 👋
            </h1>

            <p className="text-base sm:text-lg text-cyan-100 max-w-xl leading-relaxed">
              {enrolledCount > 0 ? (
                <>
                  You have <span className="font-bold text-white">{enrolledCount} enrolled {enrolledCount === 1 ? "course" : "courses"}</span> ({activeCount} active in progress) and have earned{" "}
                  <span className="font-bold text-emerald-300">{certificatesCount} {certificatesCount === 1 ? "certificate" : "certificates"}</span>.
                </>
              ) : (
                "Explore our extensive course catalog and start your interactive learning journey today!"
              )}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {resumeCourse ? (
                <button
                  type="button"
                  onClick={() => navigate(`/learn/${resumeCourse.courseId}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-7 py-3.5 text-sm font-bold shadow-xl transition hover:bg-slate-100 hover:scale-105"
                >
                  <PlayCircle size={18} className="text-teal-600 fill-teal-600" />
                  Resume Learning
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/course")}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-7 py-3.5 text-sm font-bold shadow-xl transition hover:bg-slate-100 hover:scale-105"
                >
                  <Compass size={18} className="text-teal-600" />
                  Explore Courses
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/my-learning")}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 text-sm font-semibold backdrop-blur-md transition"
              >
                <BookOpen size={16} />
                My Learning
              </button>
            </div>
          </div>

          {/* Right Column: Quick Resume Card & Real Metrics Grid */}
          <div className="lg:col-span-5 space-y-4">
            {/* Real Resume / Focus Card */}
            {resumeCourse ? (
              <div className="rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Pick Up Where You Left Off
                  </span>
                  <span className="rounded-full bg-emerald-400/20 text-emerald-300 px-3 py-0.5 text-xs font-semibold border border-emerald-400/30">
                    {resumeCourse.progressPercentage}% Completed
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base line-clamp-1">
                    {resumeCourse.courseTitle}
                  </h4>
                  {resumeCourse.lessonTitle && (
                    <p className="text-xs text-cyan-200 line-clamp-1 mt-0.5">
                      Next: {resumeCourse.lessonTitle}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-300 rounded-full transition-all duration-500"
                    style={{ width: `${resumeCourse.progressPercentage}%` }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-cyan-100">
                  <span>Interactive Curriculum</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/learn/${resumeCourse.courseId}`)}
                    className="font-bold text-white underline hover:text-cyan-200 transition"
                  >
                    Continue Lesson →
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center text-cyan-100 space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cyan-300">
                  <BookOpen size={20} />
                </div>
                <h4 className="font-bold text-white text-sm">Ready to Start Learning?</h4>
                <p className="text-xs text-cyan-200 max-w-xs mx-auto leading-relaxed">
                  Enroll in a course to track lessons, participate in assessments, and earn certificates.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/course")}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition"
                >
                  Browse Course Catalog →
                </button>
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <p className="text-2xl font-black text-white">{loading ? "—" : enrolledCount}</p>
                <p className="text-[11px] text-cyan-200 mt-1 font-medium">Enrolled</p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <p className="text-2xl font-black text-emerald-300">{loading ? "—" : activeCount}</p>
                <p className="text-[11px] text-cyan-200 mt-1 font-medium">In Progress</p>
              </div>

              <div
                onClick={() => certificatesCount > 0 && navigate("/certificates")}
                className={`rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center ${
                  certificatesCount > 0 ? "cursor-pointer hover:bg-white/20 transition" : ""
                }`}
              >
                <p className="text-2xl font-black text-cyan-300 flex items-center justify-center gap-1">
                  <Award size={18} className="text-cyan-300" />
                  {loading ? "—" : certificatesCount}
                </p>
                <p className="text-[11px] text-cyan-200 mt-1 font-medium">Certificates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
