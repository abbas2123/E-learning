type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
  className,
}: SectionTitleProps) {
  return (
    <div className={className}>
      <p className="mb-4 inline-flex rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
        {eyebrow}
      </p>
      <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          {description}
        </p>
      ) : null}
    </div>
  );
}
