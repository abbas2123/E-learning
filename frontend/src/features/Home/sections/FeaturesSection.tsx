import { memo } from "react";
import SectionHeading from "../components/SectionHeading";
import FeatureRow from "../components/FeatureRow";
import { features } from "../components/FeatureData";

function FeaturesSection() {
  console.log("FeaturesSection");
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      {/* Decorative Global Background Blobs & Ambient Lighting */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 h-[600px] w-[900px] bg-gradient-to-tr from-cyan-100/30 via-slate-50/50 to-pink-100/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-2/3 -right-24 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

      {/* Floating Accent Dots & Shapes */}
      <div className="pointer-events-none absolute top-20 right-12 h-4 w-4 rounded-full bg-cyan-400 opacity-60 animate-pulse" />
      <div className="pointer-events-none absolute top-60 left-16 h-3 w-3 rounded-full bg-pink-400 opacity-60" />
      <div className="pointer-events-none absolute bottom-40 left-20 h-5 w-5 rounded-full bg-amber-400 opacity-50 animate-bounce" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Heading */}
        <SectionHeading />

        {/* Feature Rows List */}
        <div className="space-y-28 lg:space-y-36">
          {features.map((feature, index) => (
            <FeatureRow
              key={feature.id}
              title={feature.title}
              highlightText={feature.highlightText}
              description={feature.description}
              bullets={feature.bullets}
              illustration={feature.illustration}
              reverse={index % 2 === 1}
            />
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-24 text-center">
          <button className="inline-flex items-center justify-center rounded-full border-2 border-cyan-500 text-cyan-600 font-semibold px-9 py-3.5 text-base transition-all duration-300 hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-cyan-200">
            See More Features
          </button>
        </div>
      </div>
    </section>
  );
}
export default memo(FeaturesSection);
