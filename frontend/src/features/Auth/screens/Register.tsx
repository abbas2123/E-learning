import { useState, type FormEvent } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthTabs from "../components/authTab";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import {
  registerSchema,
  extractZodErrors,
  type RegisterFormData,
} from "../schemas/authSchema";
import { toast } from "sonner";

export default function Register() {
  const { isLoggedIn, user, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Zod field errors state
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent logged-in users from staying on register page (e.g. via back button)
  if (isLoggedIn) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const validateWithZod = (): boolean => {
    const result = registerSchema.safeParse({
      username,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const errors = extractZodErrors<RegisterFormData>(result.error);
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Run Zod schema validation
    if (!validateWithZod()) {
      setErrorMessage("Please fix the validation errors below.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        name: username.trim(),
        email: email.trim(),
        password: password,
      });

      if (response.requireOtp) {
        toast.info("Verification code sent!", {
          description: "Please check your email or console logs for the 6-digit OTP code.",
        });
        navigate("/verify-otp", { state: { email: email.trim() }, replace: true });
        return;
      }

      toast.success(`Account created! Welcome 🎉`, {
        description: "You are now logged in and ready to learn.",
      });

      navigate("/", { replace: true });
    } catch (err: any) {
      const message =
        err?.message || "Registration failed. Please check your details and try again.";
      setErrorMessage(message);
      toast.error("Registration failed", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (mode: "login" | "register") => {
    if (mode === "login") {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Left Home Link */}
      <Link
        to="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-white transition-all z-20"
      >
        ← Back to Home
      </Link>

      {/* Main Authentication Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-[36px] shadow-2xl p-6 sm:p-8 lg:p-10 border border-slate-100 transition-all duration-500">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Left Column: Image Card */}
          <div className="lg:col-span-6 relative overflow-hidden rounded-[28px] aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:h-[580px] shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"
              alt="Classroom students"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            {/* Bottom Overlay Text */}
            <div className="absolute bottom-8 left-8 right-8 text-white space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">
                Join TOTC Community
              </h3>
              <p className="text-sm text-slate-200 font-normal">
                Start your journey with thousands of students worldwide.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form */}
          <div className="lg:col-span-6 flex flex-col justify-center px-2 sm:px-6 space-y-5">
            {/* Top Tag & Mode Tabs */}
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-slate-600">
                Create an account to get started!
              </p>

              {/* Segmented Auth Mode Switcher */}
              <AuthTabs activeMode="register" onModeChange={handleTabChange} />
            </div>

            {/* Subtitle Description */}
            <p className="text-xs text-slate-500 text-center max-w-md mx-auto leading-relaxed">
              Fill in your details below to create your student account.
            </p>

            {/* Error Feedback Banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center animate-fadeIn">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1" noValidate>
              {/* User Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  User name
                </label>
                <input
                  type="text"
                  placeholder="Enter your User name"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      setFieldErrors((prev) => ({ ...prev, username: undefined }));
                    }
                  }}
                  className={`w-full rounded-full border ${
                    fieldErrors.username
                      ? "border-rose-500 focus:ring-rose-400"
                      : "border-[#49BBBD]/40 focus:ring-[#49BBBD]/60"
                  } px-5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
                />
                {fieldErrors.username && (
                  <p className="text-[11px] text-rose-500 pl-4 font-medium">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`w-full rounded-full border ${
                    fieldErrors.email
                      ? "border-rose-500 focus:ring-rose-400"
                      : "border-[#49BBBD]/40 focus:ring-[#49BBBD]/60"
                  } px-5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-500 pl-4 font-medium">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                      if (confirmPassword && fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    className={`w-full rounded-full border ${
                      fieldErrors.password
                        ? "border-rose-500 focus:ring-rose-400"
                        : "border-[#49BBBD]/40 focus:ring-[#49BBBD]/60"
                    } px-5 py-2.5 pr-12 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-500 pl-4 font-medium">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    className={`w-full rounded-full border ${
                      fieldErrors.confirmPassword
                        ? "border-rose-500 focus:ring-rose-400"
                        : "border-[#49BBBD]/40 focus:ring-[#49BBBD]/60"
                    } px-5 py-2.5 pr-12 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 pl-4 font-medium">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[160px] rounded-full bg-[#49BBBD] hover:bg-[#3cb0b2] active:scale-95 text-white font-semibold text-sm py-3 px-8 shadow-lg shadow-[#49BBBD]/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
