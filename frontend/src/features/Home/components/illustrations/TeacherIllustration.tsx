export default function TeacherIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto p-4 sm:p-8 flex items-center justify-center">
      {/* Background Soft Colorful Blobs */}
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-tr from-rose-200/60 to-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-amber-300/40 blur-2xl" />
      <div className="pointer-events-none absolute -top-4 -right-4 h-32 w-32 rounded-full bg-cyan-300/40 blur-2xl" />

      {/* Main Container with Circular Framing */}
      <div className="relative flex items-center justify-center">
        {/* Main Coral Backdrop Circle */}
        <div className="relative h-72 w-72 sm:h-88 sm:w-88 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-2 shadow-2xl flex items-center justify-center">
          {/* Inner Ring */}
          <div className="h-full w-full rounded-full border-4 border-white/30 overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
              alt="Teacher"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>

        {/* Floating Decoration Badge Top-Left (Blue Lesson Card) */}
        <div className="absolute -top-3 -left-4 sm:top-2 sm:-left-8 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-100 shadow-xl flex items-center gap-3 transition-transform duration-300 hover:scale-105">
          <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
            </svg>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800">Lesson Plans</p>
            <p className="text-[10px] text-slate-500">Structured & Ready</p>
          </div>
        </div>

        {/* Floating Decoration Badge Top-Right (Purple Shield Card) */}
        <div className="absolute -top-2 -right-4 sm:top-4 sm:-right-8 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-100 shadow-xl flex items-center gap-3 transition-transform duration-300 hover:scale-105">
          <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800">Smart Tools</p>
            <p className="text-[10px] text-slate-500">Live Assistance</p>
          </div>
        </div>

        {/* Bottom Floating Decorative Spheres */}
        <div className="absolute -bottom-4 left-6 h-7 w-7 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 animate-bounce" />
        <div className="absolute -bottom-6 right-10 h-9 w-9 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
        <div className="absolute top-1/2 -left-10 h-4 w-4 rounded-full bg-cyan-400" />
      </div>
    </div>
  );
}
