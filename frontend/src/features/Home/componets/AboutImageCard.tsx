export default function AboutImageCard() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute -right-16 top-6 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute left-0 bottom-6 h-28 w-28 rounded-full bg-orange-400/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-white/6 to-white/3 p-6 shadow-[0_25px_80px_-30px_rgba(6,24,55,0.12)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),transparent)] mix-blend-overlay" />

        <img
          src="/student.png"
          alt="Student studying"
          className="relative mx-auto h-[520px] w-full max-w-[560px] rounded-[20px] object-cover"
        />

        <div className="absolute left-6 bottom-6 flex w-[82%] items-center justify-between rounded-[18px] bg-white/95 p-3 shadow-md">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              User Experience Class
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Live session starting July 28
            </p>
          </div>
          <button className="ml-4 rounded-full bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700">
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
