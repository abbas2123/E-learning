type CourseCardProps = {
  title: string;
  description: string;
  label?: string;
  accent?: string;
};

export default function CourseCard({
  title,
  description,
  label,
  accent = "",
}: CourseCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-[24px] border border-slate-800 bg-slate-900/85 p-6 shadow-[0_18px_60px_-24px_rgba(6,24,55,0.12)] transition-transform hover:-translate-y-2 hover:shadow-2xl">
      <div>
        {label ? (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent}`}
          >
            {label}
          </span>
        ) : null}

        <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-4 text-slate-400">{description}</p>
      </div>

      <div className="mt-6">
        <button className="inline-flex items-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600">
          View course
        </button>
      </div>
    </div>
  );
}
