import TestimonialCard from "../componets/TestimonialCard";
import { memo } from "react";
const defaultTestimonials = [
  {
    id: "t1",
    quote:
      "TOTC helped me switch careers faster than I expected. The mentors were supportive and the curriculum was practical.",
    name: "Amira Khan",
    role: "UI/UX Designer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "The live projects and placement guidance made all the difference. I landed a role in just two months.",
    name: "Ravi Patel",
    role: "Frontend Developer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "I loved the project-based learning and the coach feedback. It made studying from home feel powerful.",
    name: "Sara Ahmed",
    role: "Product Designer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
];

function TestimonialsSection() {
  console.log("TestimonialsSection");
  return (
    <section className="bg-white py-28 border-t border-slate-100">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
            What They Say
          </span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Real stories from successful students
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {defaultTestimonials.map((t) => (
            <TestimonialCard
              key={t.id}
              quote={t.quote}
              name={t.name}
              role={t.role}
              avatar={t.avatar}
              rating={t.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
export default memo(TestimonialsSection);
