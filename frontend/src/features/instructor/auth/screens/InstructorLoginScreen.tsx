import { useState, type FormEvent } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  BookOpen,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "sonner";

export default function InstructorLoginScreen() {
  const { isLoggedIn, user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as instructor or admin, redirect to studio dashboard
  if (isLoggedIn) {
    if (user?.role === "instructor" || user?.role === "admin") {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    // If logged in as student, redirect to apply page or home
    return <Navigate to="/instructor/apply" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await login({ email: trimmedEmail, password });

      if (response.requireOtp) {
        toast.info("Verification Required", {
          description: "An OTP verification code was sent to your email.",
        });
        navigate("/verify-otp", {
          state: { email: trimmedEmail },
          replace: true,
        });
        return;
      }

      if (response.user?.role !== "instructor" && response.user?.role !== "admin") {
        toast.warning("Student Account Detected", {
          description: "This portal is for instructors. Redirecting to course dashboard.",
        });
        navigate("/", { replace: true });
        return;
      }

      toast.success("Welcome back to Instructor Studio! 👨‍🏫", {
        description: `Logged in as ${response.user.name}`,
      });

      navigate("/instructor/dashboard", { replace: true });
    } catch (err: any) {
      if (
        err?.requireOtp ||
        err?.response?.data?.requireOtp ||
        (typeof err?.message === "string" &&
          err.message.toLowerCase().includes("not verified")) ||
        (typeof err?.response?.data?.message === "string" &&
          err.response.data.message.toLowerCase().includes("not verified"))
      ) {
        toast.info("Verification Required", {
          description:
            "Your instructor account is not verified. An OTP code has been sent to your email.",
        });
        navigate("/verify-otp", {
          state: { email: err?.email || err?.response?.data?.email || trimmedEmail },
          replace: true,
        });
        return;
      }

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid instructor credentials. Please try again.";
      setErrorMessage(message);
      toast.error("Login Failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Left Navigation Link */}
      <Link
        to="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-300 shadow-md hover:bg-slate-800 hover:text-white transition-all z-20"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Branding Showcase */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg">
                <GraduationCap size={26} />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-300">
                <Sparkles size={12} />
                TOTC Instructor Studio
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome to Your Teaching Portal
              </h2>

              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Manage curriculum, publish interactive video lectures, build automated quizzes, and track earnings.
              </p>
            </div>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <BookOpen size={16} className="text-indigo-400" />
                <span>Multi-module curriculum builder</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <TrendingUp size={16} className="text-emerald-400" />
                <span>Real-time enrollment & revenue analytics</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Award size={16} className="text-purple-400" />
                <span>Automated student certificate issuance</span>
              </div>
            </div>
          </div>

          {/* Right Column: Instructor Login Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div className="text-left">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Instructor Sign In
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Enter your credentials to access your instructor dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-fadeIn">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instructor Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="instructor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Authenticating Studio...
                    </>
                  ) : (
                    <>
                      Sign In to Studio
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span>
                New instructor?{" "}
                <Link
                  to="/instructor/register"
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Register as Instructor
                </Link>
              </span>
              <span>
                Are you a student?{" "}
                <Link
                  to="/login"
                  className="font-bold text-slate-300 hover:text-white transition"
                >
                  Student Login
                </Link>
              </span>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              Protected by TLS encryption and role-based security guards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
