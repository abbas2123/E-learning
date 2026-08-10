export type BulletColorClass =
  | "cyan"
  | "emerald"
  | "orange"
  | "violet"
  | "pink"
  | "indigo"
  | "purple";

type FeatureBulletProps = {
  text: string;
  colorClass?: BulletColorClass;
};

const iconBgMap: Record<BulletColorClass, string> = {
  cyan: "bg-cyan-50 text-cyan-600 border-cyan-100 shadow-cyan-100/50",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
  orange: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
  violet: "bg-violet-50 text-violet-600 border-violet-100 shadow-violet-100/50",
  pink: "bg-pink-50 text-pink-600 border-pink-100 shadow-pink-100/50",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
  purple: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100/50",
};

export default function FeatureBullet({
  text,
  colorClass = "cyan",
}: FeatureBulletProps) {
  return (
    <li className="group flex items-start gap-4 p-2.5 rounded-2xl transition-all duration-300 hover:bg-slate-50/80">
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${iconBgMap[colorClass]}`}
      >
        <svg
          className="h-5 w-5 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-1.5 font-medium">
        {text}
      </p>
    </li>
  );
}
