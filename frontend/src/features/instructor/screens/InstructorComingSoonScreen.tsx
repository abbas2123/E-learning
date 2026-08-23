import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function InstructorComingSoonScreen() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-2xl">
          <GraduationCap size={40} />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300">
          <Sparkles size={14} />
          Instructor Portal Architecture
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Become a TOTC Instructor
        </h1>
        <p className="mt-4 text-base text-slate-400 max-w-lg mx-auto leading-7">
          Share your expert skills with over 250,000 active students worldwide. The TOTC Instructor Studio is currently undergoing final authorization reviews.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="font-bold text-sm text-white">Create Courses</h4>
            <p className="mt-1 text-xs text-slate-400">Multi-module curriculum builder with video support.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="font-bold text-sm text-white">Earn Revenue</h4>
            <p className="mt-1 text-xs text-slate-400">Direct payouts via automated payment gateways.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="font-bold text-sm text-white">Analytics</h4>
            <p className="mt-1 text-xs text-slate-400">Track student engagement and course ratings.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/course")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
          >
            Explore Courses
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            Back to Home
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          Instructor role provisioning is managed by TOTC Administrators.
        </p>
      </div>
    </main>
  );
}
