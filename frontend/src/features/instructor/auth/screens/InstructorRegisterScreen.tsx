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
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function InstructorRegisterScreen() {
  const { isLoggedIn, user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [expertise, setExpertise] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in as instructor or admin, redirect to studio dashboard
  if (isLoggedIn) {
    if (user?.role === "instructor" || user?.role === "admin") {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    return <Navigate to="/instructor/apply" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        role: "instructor",
      });

      if (response.requireOtp) {
        toast.info("Verification Code Dispatched!", {
          description: "Please check your email or console logs for the 6-digit OTP code.",
        });
        navigate("/verify-otp", {
          state: { email: trimmedEmail },
          replace: true,
        });
        return;
      }

      toast.success("Instructor Account Activated! 🎉", {
        description: "Welcome to the TOTC Instructor Studio.",
      });

      navigate("/instructor/dashboard", { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please check your details.";
      setErrorMessage(message);
      toast.error("Registration Failed", { description: message });
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
          {/* Left Column: Benefits Banner */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg">
                <GraduationCap size={26} />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-300">
                <Sparkles size={12} />
                Teach & Monetize
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Join the TOTC Instructor Community
              </h2>

              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Create full-length courses, publish quizzes, track live student progress, and get paid with automated Razorpay transfers.
              </p>
            </div>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Zero upfront platform listing fees</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>High-performance Cloudinary video streaming</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Automated student completion certificates</span>
              </div>
            </div>
          </div>

          {/* Right Column: Instructor Registration Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div className="text-left">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Create Instructor Account
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Sign up to start building and publishing courses on TOTC.
              </p>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-fadeIn">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instructor Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.instructor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Subject / Field of Expertise (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Web Development, Machine Learning"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating Instructor Account...
                    </>
                  ) : (
                    <>
                      Register as Instructor
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span>
                Already have an instructor account?{" "}
                <Link
                  to="/instructor/login"
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Instructor Sign In
                </Link>
              </span>
              <span>
                Want to learn as a student?{" "}
                <Link
                  to="/register"
                  className="font-bold text-slate-300 hover:text-white transition"
                >
                  Student Sign Up
                </Link>
              </span>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              Verified with 6-digit email OTP security code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
