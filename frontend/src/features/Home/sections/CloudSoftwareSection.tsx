import Container from "../../../components/Container";
import CloudFeatureCard from "../componets/CloudFeatureCard";
import { FiCloud, FiLayers, FiShield, FiDatabase } from "react-icons/fi";

const defaultFeatures = [
  {
    id: "f1",
    icon: <FiCloud className="h-6 w-6" />,
    title: "All-in-one Cloud Platform",
    description: "Deploy, monitor and scale online classrooms with a single unified dashboard.",
  },
  {
    id: "f2",
    icon: <FiLayers className="h-6 w-6" />,
    title: "Integrated Teaching Tools",
    description: "Quizzes, gradebooks, live video calls, and instant feedback built for learning.",
  },
  {
    id: "f3",
    icon: <FiShield className="h-6 w-6" />,
    title: "Enterprise Security",
    description: "Identity policies, FERPA compliance, and secure data controls out of the box.",
  },
  {
    id: "f4",
    icon: <FiDatabase className="h-6 w-6" />,
    title: "Managed Gradebook Analytics",
    description: "Real-time student progress tracking, automated scoring, and performance reports.",
  },
];

export default function CloudSoftwareSection() {
  return (
    <section className="bg-white py-24 text-slate-900 border-t border-slate-100">
      <Container className="space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
            All-in-one
          </p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900">
            All-in-one cloud software for teams and classrooms
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
            Everything educators and students need to manage scheduling, attendance, live video classrooms, and gradebooks — in one secure cloud platform.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {defaultFeatures.map((f) => (
            <CloudFeatureCard
              key={f.id}
              icon={f.icon}
              title={f.title}
              description={f.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
