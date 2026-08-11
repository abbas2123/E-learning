interface Certificate {
  id: number;
  title: string;
  subtitle: string;
}

interface CertificateCardProps {
  certificate: Certificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <article className="flex min-h-[58px] items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm transition hover:shadow-md">
      {/* Information */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f8f0e7]">
          <span className="text-base">🏆</span>
        </div>

        {/* Text */}
        <div className="min-w-0">
          <h3 className="truncate text-[9px] font-bold text-[#252a43]">
            {certificate.title}
          </h3>

          <p className="mt-1 text-[7px] text-gray-400">
            {certificate.subtitle}
          </p>
        </div>
      </div>

      {/* Download */}
      <button
        type="button"
        className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e9fbfb] text-[#53C4C8] transition hover:bg-[#d7f5f5]"
        aria-label="Download certificate"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
          />
        </svg>
      </button>
    </article>
  );
}
