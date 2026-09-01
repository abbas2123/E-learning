import type { ReactNode } from "react";
import FeatureBullet, { type BulletColorClass } from "./FeatureBullet";

export type FeatureBulletItem = {
  text: string;
  colorClass: BulletColorClass;
};

export type FeatureRowProps = {
  title: string;
  highlightText?: string;
  description: string;
  bullets: FeatureBulletItem[];
  illustration: ReactNode;
  reverse?: boolean;
};

export default function FeatureRow({
  title,
  highlightText,
  description,
  bullets,
  illustration,
  reverse = false,
}: FeatureRowProps) {
  return (
    <div className="relative group transition-all duration-500">
      {/* Background soft radial ambient glow behind row */}
      <div
        className={`pointer-events-none absolute -inset-4 rounded-[40px] bg-gradient-to-r ${
          reverse
            ? "from-violet-100/40 via-cyan-50/30 to-transparent"
            : "from-cyan-100/40 via-emerald-50/30 to-transparent"
        } opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        {/* Illustration Container - Mobile: Order 1 (Always top), Desktop: Alternate based on reverse */}
        <div
          className={`order-1 ${
            reverse ? "lg:order-2 lg:col-span-7" : "lg:order-1 lg:col-span-7"
          } min-w-0 flex justify-center items-center`}
        >
          <div className="min-w-0 w-full transition-all duration-500 transform group-hover:scale-[1.02] group-hover:-translate-y-1">
            {illustration}
          </div>
        </div>

        {/* Content Container - Mobile: Order 2 (Below), Desktop: Alternate based on reverse */}
        <div
          className={`order-2 ${
            reverse
              ? "lg:order-1 lg:col-span-5 text-center lg:text-left"
              : "lg:order-2 lg:col-span-5 text-center lg:text-left"
          } min-w-0 flex flex-col justify-center gap-6`}
        >
          <div className="space-y-4">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {highlightText ? (
                <>
                  {title.split(highlightText)[0]}
                  <span className="text-cyan-500">{highlightText}</span>
                  {title.split(highlightText)[1]}
                </>
              ) : (
                title
              )}
            </h3>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              {description}
            </p>
          </div>

          <ul className="grid gap-2 pt-2 text-left">
            {bullets.map((bullet, idx) => (
              <FeatureBullet
                key={idx}
                text={bullet.text}
                colorClass={bullet.colorClass}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
