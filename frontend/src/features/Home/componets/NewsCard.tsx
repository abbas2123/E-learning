type NewsCardProps = {
  title: string;
  excerpt: string;
  date?: string;
};

export default function NewsCard({
  title,
  excerpt,
  date = "Aug 1, 2026",
}: NewsCardProps) {
  return (
    <article className="group rounded-[20px] border border-slate-200 bg-white p-4 transition-shadow hover:shadow-lg">
      <h4 className="text-lg font-semibold text-slate-900 group-hover:text-cyan-600">
        {title}
      </h4>
      <p className="mt-2 text-sm text-slate-600">{excerpt}</p>
      <div className="mt-4 flex items-center justify-between">
        <time className="text-xs text-slate-500">{date}</time>
        <a
          className="text-sm font-semibold text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"
          href="#"
        >
          Read
        </a>
      </div>
    </article>
  );
}
