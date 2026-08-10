export default function DiscussionIllustration() {
  return (
    <div className="relative w-full max-w-xl mx-auto p-4 sm:p-6">
      {/* Background Soft Radial Glow */}
      <div className="pointer-events-none absolute -top-8 right-4 h-48 w-48 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-36 w-36 rounded-full bg-blue-300/30 blur-2xl" />

      {/* Floating Chat Icon Badge */}
      <div className="absolute top-2 -left-2 h-11 w-11 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center z-20">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
        </svg>
      </div>

      {/* Main Outer Browser Window */}
      <div className="relative rounded-[28px] bg-slate-50 border border-slate-200/80 p-4 sm:p-6 shadow-2xl transition-all duration-500 hover:shadow-cyan-100/50">
        {/* Browser Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
          <div className="h-3 w-3 rounded-full bg-rose-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        {/* Inner Modal Card: Private Discussion */}
        <div className="relative rounded-2xl bg-white p-5 shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-bold text-slate-800 text-sm">Private Discussion</h5>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active Call
            </span>
          </div>

          {/* 2 Side-by-Side Participant Video Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Instructor */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3] shadow-md">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                alt="Instructor"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                Instructor
              </span>
            </div>

            {/* Student (Patricia Mendoza) */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3] shadow-md">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
                alt="Patricia Mendoza"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-medium truncate max-w-[85%]">
                Patricia Mendoza
              </span>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Private 1-on-1 session in progress
            </p>
            <button className="w-full sm:w-auto rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-5 py-2 shadow-lg shadow-rose-500/30 transition-all">
              End Discussion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
