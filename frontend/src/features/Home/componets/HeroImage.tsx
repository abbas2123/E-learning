import FloatingCards from "./FloatingCards";

export default function HeroImage() {
  return (
    <div className="relative mx-auto w-full max-w-[840px] lg:max-w-[720px]">
      <div className="absolute -left-16 top-6 h-72 w-72 rounded-full bg-white/8 blur-[72px]" />
      <div className="absolute right-0 top-24 h-56 w-56 rounded-full bg-orange-300/18 blur-[60px]" />

      {/* soft radial glow behind the student image */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[640px] w-[640px] rounded-full blur-[120px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.16)_0%,rgba(83,196,200,0.06)_35%,transparent_60%)]" />

      <div className="relative overflow-hidden rounded-[48px] border border-white/15 bg-white/8 p-4 shadow-[0_30px_80px_-30px_rgba(6,24,55,0.2)] ring-1 ring-white/20 backdrop-blur-xl">
        <img
          src="/student.png"
          alt="Student holding books"
          className="relative mx-auto h-[680px] w-full rounded-[36px] object-cover"
        />

        <FloatingCards />
      </div>
    </div>
  );
}
