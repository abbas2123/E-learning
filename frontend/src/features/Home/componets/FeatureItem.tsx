import Button from "../../../components/Button";

type FeatureItemProps = {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
};

export default function FeatureItem({
  title,
  description,
  image,
  reverse = false,
}: FeatureItemProps) {
  return (
    <div
      className={`grid items-center gap-8 lg:grid-cols-2 ${reverse ? "lg:grid-cols-[0.95fr_1.05fr] lg:direction-rtl" : ""}`}
    >
      <div className={`order-2 lg:order-1 ${reverse ? "lg:pl-12" : ""}`}>
        <h3 className="text-3xl font-extrabold text-slate-900">{title}</h3>
        <p className="mt-4 max-w-xl text-lg text-slate-600">{description}</p>
        <div className="mt-6">
          <Button variant="primary">Explore feature</Button>
        </div>
      </div>

      <div
        className={`relative order-1 lg:order-2 ${reverse ? "lg:pr-12" : ""}`}
      >
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-28 w-28 rounded-full bg-fuchsia-100/50 blur-2xl" />

        <div className="overflow-hidden rounded-[20px] border border-slate-100 shadow-[0_18px_60px_-24px_rgba(6,24,55,0.08)]">
          <img src={image} alt={title} className="block w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
