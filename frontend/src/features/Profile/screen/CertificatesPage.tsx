import Certificates from "../components/Certificates";

export default function CertificatesPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My Certificates
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, download, and share your official course completion credentials.
          </p>
        </div>
        <Certificates />
      </div>
    </main>
  );
}
