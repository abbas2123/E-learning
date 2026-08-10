type StatisticCardProps = {
  value: string;
  label: string;
  description?: string;
};

export default function StatisticCard({
  value,
  label,
  description,
}: StatisticCardProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-10px_rgba(6,24,55,0.08)]">
      <p className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
        {value}
      </p>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
