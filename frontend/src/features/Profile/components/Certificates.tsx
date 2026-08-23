import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import certificateService, { type CertificateData } from "../../../services/certificateService";
import { toast } from "sonner";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function Certificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService
      .getUserCertificates()
      .then((data) => setCertificates(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShare = (cert: CertificateData) => {
    const url = cert.verificationUrl;
    if (navigator.share) {
      navigator.share({
        title: `TOTC Certificate — ${cert.courseTitle}`,
        text: `Verified completion certificate for ${cert.courseTitle}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Certificate verification link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="No certificates earned yet"
        description="Complete 100% of any enrolled course to earn your official verified certificate."
        actionLabel="Go to My Learning"
        onAction={() => navigate("/my-learning")}
      />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award size={18} className="text-indigo-600" />
          Earned Credentials ({certificates.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Award size={22} />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                Verified ✓
              </span>
            </div>

            <div className="mt-4">
              <h3 className="line-clamp-1 font-bold text-slate-900 group-hover:text-indigo-600">
                {cert.courseTitle}
              </h3>
              <p className="mt-1 font-mono text-[11px] text-slate-400">
                ID: {cert.certificateId}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Issued: {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
              <a
                href={certificateService.getDownloadUrl(cert.certificateId)}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
              >
                <Download size={14} />
                Download PDF
              </a>

              <button
                type="button"
                onClick={() => navigate(`/certificates/verify/${cert.certificateId}`)}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
                title="Verify Online"
              >
                <ExternalLink size={15} />
              </button>

              <button
                type="button"
                onClick={() => handleShare(cert)}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
                title="Share Certificate"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
