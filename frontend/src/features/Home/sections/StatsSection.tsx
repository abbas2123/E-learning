import Container from "../../../components/Container";
import StatisticCard from "../componets/StatisticCard";

const defaultStats = [
  {
    value: "250k+",
    label: "Learners",
    description: "Trusted learners across the globe.",
  },
  {
    value: "15K+",
    label: "Courses",
    description: "High-quality, project-based courses.",
  },
  {
    value: "95%",
    label: "Completion Rate",
    description: "Students finishing with applied skills.",
  },
  {
    value: "4.9/5",
    label: "Avg. Rating",
    description: "From real student feedback.",
  },
  {
    value: "120+",
    label: "Hiring Partners",
    description: "Companies hiring our graduates.",
  },
];

export default function StatsSection() {
  return (
    <section className="bg-white py-28 text-slate-900">
      <Container className="space-y-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
            Our Success
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
            Real outcomes, measurable impact
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
            We help learners build job-ready skills through hands-on learning, mentorship, and real projects — and the results speak for themselves.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {defaultStats.map((s) => (
            <StatisticCard
              key={s.label}
              value={s.value}
              label={s.label}
              description={s.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
