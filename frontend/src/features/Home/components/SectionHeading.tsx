type SectionHeadingProps = {
  subtitle?: string;
  title?: string;
  description?: string;
};

export default function SectionHeading({
  title = "Powerful tools built for modern classrooms",
  description = "This very extraordinary feature, can make learning activities more efficient",
}: SectionHeadingProps) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
      <div className="inline-flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Our <span className="text-cyan-500">Features</span>
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
        {title}
      </h2>
      <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
        {description}
      </p>
    </div>
  );
}
