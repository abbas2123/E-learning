import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";
import { useNavigate, Navigate } from "react-router-dom";

const AdminLoginScreen = () => {
  const { isLoggedIn, user, adminLogin } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in as admin, redirect to admin dashboard
  if (isLoggedIn && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await adminLogin({
        email: trimmedEmail,
        password,
      });

      if (!response.user || response.user.role !== "admin") {
        throw new Error("You are not authorized to access the admin panel.");
      }

      toast.success("Welcome back!", {
        description: "Admin login successful.",
      });

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error: any) {
      if (
        error?.code === "USER_BLOCKED" ||
        error?.response?.data?.code === "USER_BLOCKED"
      ) {
        return;
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to sign in. Please check your credentials.";

      setError(message);

      toast.error("Login failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (error) {
      setError("");
    }
  };

  const handleForgotPassword = () => {
    toast.info("Please contact the system administrator.", {
      description: "Admin password recovery can be configured separately.",
    });
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen">
        {/* =====================================================
            LEFT SIDE — ADMIN BRANDING
        ====================================================== */}
        <section className="relative hidden overflow-hidden lg:flex lg:w-1/2">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

          {/* Decorative gradients */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 shadow-inner">
                <img
                  src="/image.png"
                  alt="TOTC"
                  className="h-6 w-6 object-contain"
                />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-white">
                  TOTC
                </p>

                <p className="text-xs text-slate-400">Administration</p>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-xl">
              {/* Security icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-lg shadow-indigo-950/20">
                <ShieldCheck size={28} className="text-indigo-400" />
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Welcome back,
                <br />
                Administrator.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Manage courses, lessons, users, enrollments, and everything that
                powers your learning platform.
              </p>

              {/* Feature cards */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:bg-white/[0.06]">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                    <LockKeyhole size={17} className="text-indigo-400" />
                  </div>

                  <p className="text-lg font-bold text-white">Secure</p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Protected administration access
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:bg-white/[0.06]">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
                    <ShieldCheck size={17} className="text-cyan-400" />
                  </div>

                  <p className="text-lg font-bold text-white">Control</p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Manage your learning platform
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div>
              <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} TOTC Administration
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE — LOGIN FORM
        ====================================================== */}
        <section className="flex min-h-screen w-full items-center justify-center bg-white px-5 py-12 sm:px-8 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <img
                  src="/image.png"
                  alt="TOTC"
                  className="h-6 w-6 object-contain"
                />
              </div>

              <div>
                <p className="font-bold text-slate-900">TOTC</p>

                <p className="text-xs text-slate-500">Administration</p>
              </div>
            </div>

            {/* Header */}
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <LockKeyhole size={22} className="text-indigo-600" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Admin Login
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access your administration dashboard.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100">
                  <span className="text-xs font-bold text-rose-600">!</span>
                </div>

                <p className="text-sm leading-5 text-rose-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="username"
                  disabled={loading}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Security notice */}
              <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-indigo-600"
                />

                <div>
                  <p className="text-xs font-semibold text-indigo-900">
                    Secure administrator access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-700">
                    This area is restricted to authorized administrators only.
                    Your account permissions determine what you can access.
                  </p>
                </div>
              </div>

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    Sign in to Admin Panel
                  </>
                )}
              </button>
            </form>

            {/* Back to website */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={loading}
                className="mx-auto flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Back to TOTC
              </button>
            </div>

            {/* Small security text */}
            <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">
              Authorized personnel only. If you believe you received this page
              in error, please contact your system administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminLoginScreen;
