import { useAuth } from "../../../context/AuthContext";

type LoggedInHeroProps = {
  summary?: {
    enrolledCount: number;
    activeCount: number;
    userGpa: string;
    nextClass?: {
      title: string;
      instructor: string;
      room: string;
      startTime: string;
      avatar?: string;
    };
  };
};

export default function LoggedInHero({ summary }: LoggedInHeroProps) {
  const { user } = useAuth();

  const userName = user?.name || "Student";
  const userGpa = summary?.userGpa ?? "0.00";
  const userRole = user?.role || "Student";
  const enrolledCount = summary?.enrolledCount ?? 0;
  const activeCount = summary?.activeCount ?? 0;
  const nextClass = summary?.nextClass;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-teal-600 to-slate-900 pb-20 text-white">
      {/* Background Decorative Lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 bg-emerald-400/20 blur-3xl" />

      {/* pt-24 offsets the absolute-positioned navbar from HomeLayout */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-24">
        {/* Personalized Welcome Banner */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {userRole} Learning Workspace • Active
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Welcome back, <br />
              <span className="text-cyan-300">{userName}!</span> 👋
            </h1>

            <p className="text-base sm:text-lg text-cyan-100 max-w-xl leading-relaxed">
              You are currently enrolled in{" "}
              <span className="font-bold text-white">{enrolledCount} courses</span> ({activeCount} active), and your overall GPA is{" "}
              <span className="font-bold text-emerald-300">{userGpa}</span>.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#live-class"
                className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-7 py-3.5 text-sm font-bold shadow-xl transition hover:bg-slate-100 hover:scale-105"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                Join Live Classroom
              </a>

              <a
                href="#my-courses"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 text-sm font-semibold backdrop-blur-md transition"
              >
                Resume Course
              </a>
            </div>
          </div>

          {/* Right Side: Quick Stats & Live Notification Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Class Notice Box */}
            {nextClass ? (
              <div className="rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Up Next • {nextClass.startTime}
                  </span>
                  <span className="rounded-full bg-emerald-400/20 text-emerald-300 px-3 py-0.5 text-xs font-semibold border border-emerald-400/30">
                    Upcoming
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {nextClass.avatar && (
                    <img
                      src={nextClass.avatar}
                      alt={nextClass.instructor}
                      className="h-12 w-12 rounded-2xl object-cover border-2 border-cyan-400"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {nextClass.title}
                    </h4>
                    <p className="text-xs text-cyan-200">
                      Instructor: {nextClass.instructor}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-cyan-100">
                  <span>Room: {nextClass.room}</span>
                  <a href="#live-class" className="font-bold text-white underline hover:text-cyan-200">
                    Enter Room →
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center text-cyan-100 space-y-2">
                <p className="text-sm font-semibold">No live classes scheduled for today.</p>
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <p className="text-2xl font-black text-white">{enrolledCount}</p>
                <p className="text-[11px] text-cyan-200 mt-1 font-medium">Enrolled</p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <p className="text-2xl font-black text-emerald-300">{activeCount}</p>
                <p className="text-[11px] text-cyan-200 mt-1 font-medium">Active</p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                <p className="text-2xl font-black text-cyan-300">{userGpa}</p>
                <p className="text-[11px] text-cyan-200 mt-1 font-medium">GPA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
