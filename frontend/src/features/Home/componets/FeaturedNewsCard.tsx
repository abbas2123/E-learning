import Button from "../../../components/Button";

type FeaturedNewsProps = {
  title: string;
  excerpt: string;
  image?: string;
};

export default function FeaturedNewsCard({
  title,
  excerpt,
  image = "/image.png",
}: FeaturedNewsProps) {
  return (
    <article className="relative rounded-[24px] overflow-hidden border border-slate-200 bg-white shadow-xl">
      <div className="h-56 w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
          Featured
        </p>
        <h3 className="mt-3 text-2xl font-extrabold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm text-slate-600">{excerpt}</p>

        <div className="mt-6">
          <Button variant="secondary">Read full article</Button>
        </div>
      </div>
    </article>
  );
}
