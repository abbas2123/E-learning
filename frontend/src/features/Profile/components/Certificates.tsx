import CertificateCard from "./CertificateCard";
import { certificates } from "../data/profileData";

export default function Certificates() {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-bold text-[#252a43]">
        Certificates & Achievements
      </h2>

      <div className="space-y-2.5">
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </section>
  );
}
