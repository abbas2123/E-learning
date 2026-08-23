import { useNavigate } from "react-router-dom";
import { BookOpen, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        {/* Logo */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
          <BookOpen size={32} />
        </div>

        <h1 className="mt-6 text-6xl font-black tracking-tight text-slate-900">
          404
        </h1>
        <h2 className="mt-2 text-xl font-bold text-slate-800">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Home size={16} />
            Go to Home
          </button>
          <button
            type="button"
            onClick={() => navigate("/course")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <Search size={16} />
            Browse Courses
          </button>
        </div>
      </div>
    </main>
  );
}
