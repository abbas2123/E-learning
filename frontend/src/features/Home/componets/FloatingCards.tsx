export default function FloatingCards() {
  return (
    <>
      <div className="absolute left-4 top-12 w-56 rounded-[20px] bg-white p-4 text-slate-950 shadow-md ring-1 ring-slate-200/30">
        <p className="text-2xl sm:text-3xl font-bold">250k</p>
        <p className="mt-1 text-sm text-slate-600">Assisted Students</p>
      </div>

      <div className="absolute right-6 top-36 w-52 rounded-[18px] bg-white p-4 text-slate-950 shadow-md ring-1 ring-slate-200/30">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-500">
          Upcoming
        </p>
        <p className="mt-2 text-base font-semibold">Online Course</p>
      </div>

      <div className="absolute right-10 bottom-28 w-56 rounded-[20px] bg-white p-4 text-slate-950 shadow-md ring-1 ring-slate-200/30">
        <p className="text-base font-semibold">Congratulations</p>
        <p className="mt-1 text-sm text-slate-600">Your admission completed</p>
      </div>

      <div className="absolute left-8 bottom-8 w-60 rounded-[20px] bg-white p-4 text-slate-950 shadow-md ring-1 ring-slate-200/30">
        <p className="text-base font-semibold">User Experience Class</p>
        <button className="mt-3 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600">
          Join Now
        </button>
      </div>
    </>
  );
}
