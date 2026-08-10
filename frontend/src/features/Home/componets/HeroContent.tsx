import { FiPlay } from "react-icons/fi";
import Button from "../../../components/Button";

export default function HeroContent() {
  return (
    <div className="space-y-8 lg:pr-6">
      <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-xl">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-orange-400 animate-pulse" />
        Trusted by 250k+ learners worldwide
      </div>

      <div className="space-y-6">
        <h1 className="text-[48px] leading-[1.02] font-extrabold tracking-tight text-white sm:text-[64px] lg:text-[72px]">
          <span className="text-orange-100">Studying</span> Online is
          <br />
          <span className="text-white">now much easier</span>
        </h1>
        <p className="max-w-xl text-[18px] leading-8 text-slate-200 sm:text-[20px]">
          TOTC combines interactive lessons, expert mentorship, and career support to help students finish their learning journey with confidence.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button className="w-full sm:w-auto" variant="primary">
          Join for free
        </Button>
        <Button
          className="w-full sm:w-auto inline-flex items-center gap-2"
          variant="secondary"
        >
          <FiPlay className="h-4 w-4" />
          <span>Watch how it works</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl transition-all hover:scale-[1.02]">
          <p className="text-3xl sm:text-4xl font-extrabold">25K+</p>
          <p className="mt-2 text-sm text-slate-200 font-medium">Courses completed</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl transition-all hover:scale-[1.02]">
          <p className="text-3xl sm:text-4xl font-extrabold">4.9/5</p>
          <p className="mt-2 text-sm text-slate-200 font-medium">Average student rating</p>
        </div>
      </div>
    </div>
  );
}
