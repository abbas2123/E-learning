import Container from "../../../components/Container";
import HeroContent from "../componets/HeroContent";
import HeroImage from "../componets/HeroImage";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#53C4C8] text-white">
      <div className="absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_22%)]" />
      <div className="absolute inset-x-0 inset-y-0 bg-[linear-gradient(180deg,rgba(83,196,200,1)_0%,rgba(83,196,200,0.86)_40%,rgba(255,255,255,0.1)_100%)]" />

      {/* pt-24 makes room for the absolute-positioned navbar in HomeLayout */}
      <Container className="relative z-10 pt-24 min-h-[920px] lg:min-h-[900px]">
        <div className="grid h-full items-center gap-10 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
          <HeroContent />
          <HeroImage />
        </div>
      </Container>

      <div className="absolute inset-x-0 bottom-0 -z-10 h-[360px] lg:h-[420px]">
        <svg
          viewBox="0 0 1440 320"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,224 C180,180 300,160 480,170 C660,180 780,210 960,208 C1140,206 1260,176 1440,160 L1440,320 L0,320 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}
