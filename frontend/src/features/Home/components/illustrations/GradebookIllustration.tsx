export default function GradebookIllustration() {
  return (
    <div className="relative w-full max-w-xl mx-auto p-4 sm:p-6">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute -top-10 left-10 h-48 w-48 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 right-6 h-36 w-36 rounded-full bg-purple-300/30 blur-2xl" />

      {/* Floating 3D Decoration Icons */}
      <div className="absolute -top-4 -left-2 h-12 w-12 rounded-2xl bg-amber-400 text-white shadow-lg shadow-amber-400/40 flex items-center justify-center text-xl font-bold z-20 animate-pulse">
        ★
      </div>
      <div className="absolute -top-2 -right-2 h-11 w-11 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center z-20">
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
        </svg>
      </div>

      {/* Main Gradebook Window Card */}
      <div className="relative rounded-[28px] bg-white border border-slate-100 p-6 shadow-2xl transition-all duration-500 hover:shadow-cyan-100/50">
        {/* Top GradeBook Header Bar */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-3 text-white text-center font-bold text-sm shadow-md mb-8">
          GradeBook Analytics
        </div>

        {/* Analytics Graph with Connecting Lines & Avatars */}
        <div className="relative py-6 px-2 space-y-6">
          {/* Horizontal Grid Track 1 (Cyan line - Score 100) */}
          <div className="relative flex items-center justify-between">
            <div className="h-1.5 w-full rounded-full bg-cyan-100 relative">
              <div className="h-1.5 w-3/4 rounded-full bg-cyan-400" />
            </div>
            <div className="absolute left-1/3 -top-5 flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-cyan-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Student"
                className="h-7 w-7 rounded-full object-cover border border-cyan-400"
              />
              <span className="text-xs font-extrabold text-cyan-600">100</span>
            </div>
          </div>

          {/* Horizontal Grid Track 2 (Blue line - Score 92) */}
          <div className="relative flex items-center justify-between">
            <div className="h-1.5 w-full rounded-full bg-blue-100 relative">
              <div className="h-1.5 w-2/3 rounded-full bg-blue-500" />
            </div>
            <div className="absolute left-2/3 -top-5 flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-blue-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                alt="Student"
                className="h-7 w-7 rounded-full object-cover border border-blue-500"
              />
              <span className="text-xs font-extrabold text-blue-600">92</span>
            </div>
          </div>

          {/* Horizontal Grid Track 3 (Pink line - Score 75) */}
          <div className="relative flex items-center justify-between">
            <div className="h-1.5 w-full rounded-full bg-rose-100 relative">
              <div className="h-1.5 w-1/2 rounded-full bg-rose-400" />
            </div>
            <div className="absolute left-3/4 -top-5 flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-rose-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                alt="Student"
                className="h-7 w-7 rounded-full object-cover border border-rose-400"
              />
              <span className="text-xs font-extrabold text-rose-500">75</span>
            </div>
          </div>

          {/* Horizontal Grid Track 4 (Green line - Score 85) */}
          <div className="relative flex items-center justify-between">
            <div className="h-1.5 w-full rounded-full bg-emerald-100 relative">
              <div className="h-1.5 w-3/5 rounded-full bg-emerald-400" />
            </div>
            <div className="absolute left-1/2 -top-5 flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-emerald-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                alt="Student"
                className="h-7 w-7 rounded-full object-cover border border-emerald-400"
              />
              <span className="text-xs font-extrabold text-emerald-600">85</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live Updates
          </div>
          <button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2 shadow-lg shadow-blue-500/30 transition-all">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
