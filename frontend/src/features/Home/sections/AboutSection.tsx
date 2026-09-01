import AboutImageCard from "../componets/AboutImageCard";
import Button from "../../../components/Button";

const defaultAboutFeatures = [
  {
    title: "Interactive learning",
    description:
      "Hands-on labs, live sessions, and real-world projects designed to keep students engaged.",
  },
  {
    title: "Mentor support",
    description:
      "Personalized guidance from industry experts to help you build confidence and skills.",
  },
  {
    title: "Career ready",
    description:
      "Resume workshops, interview practice, and placement guidance for every learner.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="overflow-hidden bg-slate-950 py-28 text-white"
    >
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
        <div className="space-y-6 lg:pr-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            What is TOTC?
          </div>

          <h2 className="max-w-xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            A smarter way to learn, practice, and launch your career.
          </h2>

          <p className="max-w-xl text-lg leading-8 text-slate-300">
            TOTC brings together interactive lessons, live mentorship, and
            career services so learners can build practical skills and get
            hired.
          </p>

          <div className="flex items-center gap-4">
            <Button variant="primary">Get started</Button>
            <Button variant="secondary">Request demo</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            {defaultAboutFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl transition-transform hover:scale-[1.02]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-300">
                  {feature.title}
                </p>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <AboutImageCard />
      </div>
    </section>
  );
}
