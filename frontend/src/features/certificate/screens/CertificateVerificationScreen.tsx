import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import certificateService, { type PublicVerificationData } from "../../../services/certificateService";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Award,
  Search,
  Download,
  Share2,
  Loader2,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";

export default function CertificateVerificationScreen() {
  const { certificateId: paramCertId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(paramCertId || "");
  const [verification, setVerification] = useState<PublicVerificationData | null>(null);
  const [loading, setLoading] = useState(Boolean(paramCertId));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!paramCertId) return;

    setLoading(true);
    setErrorMsg(null);
    certificateService
      .verifyCertificate(paramCertId)
      .then((data) => {
        setVerification(data);
        if (!data.valid) {
          setErrorMsg("Certificate ID not found or invalid.");
        }
      })
      .catch(() => {
        setErrorMsg("Failed to verify certificate. Please check the ID.");
        setVerification({
          valid: false,
          certificateId: paramCertId,
          studentName: "",
          courseTitle: "",
          issuedAt: "",
          completionDate: "",
          status: "invalid",
        });
      })
      .finally(() => setLoading(false));
  }, [paramCertId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/certificates/verify/${searchId.trim()}`);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "TOTC Verified Certificate",
        text: `Check out ${verification?.studentName}'s verified TOTC certificate!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Verification link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 border border-indigo-500/20 mb-3">
            <Award size={16} />
            Official TOTC Credentials Verification
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Certificate Verification System
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Verify authentic course completion certificates issued by the TOTC E-Learning Platform.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. TOTC-CERT-2026-8F3A91C2)"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
          >
            Verify
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <Loader2 size={36} className="mx-auto animate-spin text-indigo-500" />
            <p className="mt-3 text-xs font-semibold text-slate-400">
              Validating certificate credentials against global database...
            </p>
          </div>
        )}

        {/* Valid Certificate Result */}
        {!loading && verification && verification.valid && (
          <div className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900 p-8 shadow-2xl relative">
            {/* Corner Decorative Glow */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="flex items-center gap-3 text-emerald-400 mb-6">
              <CheckCircle2 size={24} className="shrink-0" />
              <span className="text-sm font-extrabold uppercase tracking-wider">
                Authentic & Verified Certificate
              </span>
            </div>

            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-6">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Student Name
                </span>
                <div className="mt-1 flex items-center gap-2.5 text-2xl font-black text-white">
                  <User size={22} className="text-indigo-400" />
                  {verification.studentName}
                </div>
              </div>

              <div className="border-b border-slate-800 pb-6">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Completed Course
                </span>
                <div className="mt-1 flex items-center gap-2.5 text-lg font-bold text-slate-200">
                  <BookOpen size={20} className="text-indigo-400" />
                  {verification.courseTitle}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-slate-400 font-medium">Certificate ID</span>
                  <p className="mt-1 font-mono font-bold text-indigo-400">
                    {verification.certificateId}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar size={13} /> Issue Date
                  </span>
                  <p className="mt-1 font-semibold text-white">
                    {new Date(verification.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={certificateService.getDownloadUrl(verification.certificateId)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  <Download size={15} />
                  Download Official PDF
                </a>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  <Share2 size={15} />
                  Share Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invalid / Not Found State */}
        {!loading && (errorMsg || (verification && !verification.valid)) && (
          <div className="rounded-3xl border border-rose-500/30 bg-slate-900 p-8 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-4">
              <XCircle size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">Invalid Certificate Record</h3>
            <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto">
              No matching record was found for Certificate ID{" "}
              <code className="text-rose-400 font-mono">{paramCertId}</code>. Please ensure the ID was typed correctly.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
