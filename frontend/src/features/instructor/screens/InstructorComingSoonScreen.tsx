import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  BookOpen,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../services/apiClient";
import { toast } from "sonner";

export default function InstructorComingSoonScreen() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    expertise: "",
    bio: "",
    experience: "3-5 years",
  });

  const isAlreadyInstructor = user?.role === "instructor" || user?.role === "admin";

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to submit an instructor application.");
      navigate("/login", { state: { from: { pathname: "/instructor/apply" } } });
      return;
    }

    if (!formData.expertise.trim()) {
      toast.error("Please specify your area of expertise.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/api/instructor/apply", formData);
      if (res.data.success) {
        setSubmitted(true);
        toast.success("Application Submitted!", {
          description: res.data.message || "Administrators will review your profile shortly.",
        });
      }
    } catch (err: any) {
      toast.error("Submission Failed", {
        description: err.response?.data?.message || err.message || "Failed to submit application.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-2xl">
          <GraduationCap size={40} />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300">
          <Sparkles size={14} />
          TOTC Instructor Network
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Teach on TOTC
        </h1>
        <p className="mt-4 text-base text-slate-400 max-w-lg mx-auto leading-7">
          Inspire thousands of students worldwide. Build high-impact courses, create quizzes, and earn direct revenue.
        </p>

        {isAlreadyInstructor ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <h3 className="mt-3 text-lg font-bold text-white">You have Instructor Access!</h3>
            <p className="mt-1 text-sm text-slate-300">Your account is verified. Access your studio dashboard to manage courses.</p>
            <button
              type="button"
              onClick={() => navigate("/instructor/dashboard")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700"
            >
              Go to Instructor Studio
              <ArrowRight size={16} />
            </button>
          </div>
        ) : submitted ? (
          <div className="mt-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-indigo-400" />
            <h3 className="mt-3 text-lg font-bold text-white">Application Under Review</h3>
            <p className="mt-1 text-sm text-slate-300">Thank you for applying! Our admin team reviews applications within 24-48 hours.</p>
            <button
              type="button"
              onClick={() => navigate("/course")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Explore Catalog
            </button>
          </div>
        ) : isApplying ? (
          <form onSubmit={handleApply} className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-left space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white">Instructor Application Form</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Primary Subject / Expertise</label>
              <input
                type="text"
                required
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                placeholder="e.g. Full-Stack Web Development, Data Science"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Teaching / Industry Experience</label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Brief Bio & Teaching Philosophy</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself and the courses you want to create..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsApplying(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit Application
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <BookOpen className="h-5 w-5 text-indigo-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Create Courses</h4>
                <p className="mt-1 text-xs text-slate-400">Multi-module curriculum builder with video and quiz support.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <DollarSign className="h-5 w-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Earn Revenue</h4>
                <p className="mt-1 text-xs text-slate-400">Direct payouts via automated Razorpay gateways.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <TrendingUp className="h-5 w-5 text-purple-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Analytics</h4>
                <p className="mt-1 text-xs text-slate-400">Track student engagement, completion rates, and ratings.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/instructor/register")}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
              >
                Register as Instructor
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/instructor/login")}
                className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800"
              >
                Instructor Sign In
              </button>
            </div>
          </>
        )}

        <p className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          Dedicated instructor credentials with automated OTP verification and studio access
        </p>
      </div>
    </main>
  );
}
