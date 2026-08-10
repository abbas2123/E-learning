import type { ReactNode } from "react";

type CloudFeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function CloudFeatureCard({
  icon,
  title,
  description,
}: CloudFeatureCardProps) {
  return (
    <div className="group relative flex h-full flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_-12px_rgba(6,24,55,0.08)] transition-transform hover:-translate-y-2 hover:shadow-lg">
      <div className="flex items-center justify-center rounded-full bg-slate-50 p-3 text-slate-900">
        <div className="h-10 w-10 text-[22px]">{icon}</div>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-auto">
        <button className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-cyan-700">
          Learn more
        </button>
      </div>
    </div>
  );
}
