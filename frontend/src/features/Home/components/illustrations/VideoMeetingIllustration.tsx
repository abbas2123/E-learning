export default function VideoMeetingIllustration() {
  return (
    <div className="relative w-full max-w-2xl mx-auto p-4 sm:p-6">
      {/* Background colorful floating decorations */}
      <div className="pointer-events-none absolute -top-8 -left-6 h-28 w-28 rounded-full bg-emerald-400/60 blur-xl animate-pulse" />
      <div className="pointer-events-none absolute top-4 left-20 h-6 w-6 rounded-full bg-cyan-400 opacity-80" />
      <div className="pointer-events-none absolute -bottom-6 right-10 h-10 w-10 rounded-full bg-rose-400/80 blur-sm" />
      <div className="pointer-events-none absolute top-1/2 -right-8 h-36 w-36 rounded-full bg-cyan-300/30 blur-2xl" />

      {/* Main Browser Window */}
      <div className="relative rounded-[28px] bg-white border border-slate-100 p-4 sm:p-6 shadow-2xl transition-all duration-500 hover:shadow-cyan-100/50">
        {/* Browser Top Bar */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="h-3 w-3 rounded-full bg-rose-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-4 h-3.5 w-48 rounded-full bg-slate-100" />
        </div>

        {/* Meeting Grid Container */}
        <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Main Presenter / Instructor Card (Left - 7 cols) */}
          <div className="sm:col-span-7 relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg group/card aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
              alt="Instructor"
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
            {/* Instructor Overlay Tag */}
            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] font-medium text-white">
              Instructor
            </div>

            {/* Bottom Action Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              <button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 shadow-lg shadow-blue-500/30 backdrop-blur-md transition-all">
                Present
              </button>
              <button className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold py-2 px-3 shadow-lg shadow-rose-500/30 backdrop-blur-md transition-all flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1 5h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" />
                </svg>
                Call
              </button>
            </div>
          </div>

          {/* Right Side: Participant Grid (5 cols) */}
          <div className="sm:col-span-5 grid grid-cols-2 gap-2.5">
            {/* Participant 1 */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-square shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="Student"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md">
                Adam L.
              </span>
            </div>

            {/* Participant 2 */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-square shadow-md">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="Student"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md">
                Oliver H.
              </span>
            </div>

            {/* Participant 3 */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-square shadow-md">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                alt="Student"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md">
                Caleb M.
              </span>
            </div>

            {/* Participant 4 */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-square shadow-md">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
                alt="Student"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md truncate max-w-[80%]">
                Patricia M.
              </span>
            </div>
          </div>

          {/* Center Floating Glass Circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-center text-cyan-600 hidden sm:flex">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
