export default function QuizIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto p-4 sm:p-6">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute -top-8 right-0 h-44 w-44 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-36 w-36 rounded-full bg-emerald-300/30 blur-2xl" />

      {/* Floating Badges outside card */}
      <div className="absolute top-2 -right-2 h-10 w-10 rounded-full bg-rose-100 border border-rose-200 text-rose-500 shadow-lg flex items-center justify-center font-bold z-20">
        ✕
      </div>
      <div className="absolute top-16 -right-5 h-12 w-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 shadow-lg flex items-center justify-center font-bold text-xl z-20">
        ✓
      </div>

      {/* Main Quiz Card */}
      <div className="relative rounded-[28px] bg-white border border-slate-100 p-6 shadow-2xl transition-all duration-500 hover:shadow-blue-100/50">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1">
            Question 1
          </span>
          <span className="text-xs text-slate-400 font-medium">01 / 10</span>
        </div>

        {/* Question Title */}
        <h4 className="text-lg font-bold text-slate-800 mb-4 leading-snug">
          True or false? This play takes place in Italy
        </h4>

        {/* Venice Photo Card */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-md border border-slate-100 mb-6">
          <img
            src="https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=600&q=80"
            alt="Venice Canal"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-2.5 left-3 text-white text-xs font-medium backdrop-blur-md bg-black/30 px-2.5 py-1 rounded-lg">
            Venice, Italy
          </span>
        </div>

        {/* Floating Answer Confirmation Card Overlay */}
        <div className="relative sm:-mb-10 bg-emerald-50/90 backdrop-blur-md border border-emerald-200/80 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 transform sm:translate-y-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-emerald-800 leading-tight">
            Your answer was sent successfully
          </p>
        </div>
      </div>
    </div>
  );
}
