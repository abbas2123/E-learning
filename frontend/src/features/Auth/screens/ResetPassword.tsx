import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLoader,
} from "react-icons/fi";
import { toast } from "sonner";
import { resetPassword } from "../../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = location.state?.resetToken;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User should not access this page without
  // successfully verifying the OTP.
  if (!resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage("Please enter your new password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        resetToken,
        password,
      });

      toast.success("Password reset successfully!", {
        description: "Your password has been updated. Please sign in.",
      });

      navigate("/login", {
        replace: true,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to reset your password. Please try again.";

      setErrorMessage(message);

      toast.error("Password reset failed", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <Link
        to="/login"
        className="fixed top-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-white transition-all z-20"
      >
        <FiArrowLeft />
        Back to Login
      </Link>

      <div className="w-full max-w-md bg-white rounded-[36px] shadow-2xl p-8 sm:p-10 border border-slate-100 space-y-7 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-3xl shadow-inner">
          <FiCheckCircle />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Reset Password
          </h1>

          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Create a new password for your account. Make sure it's strong and
            easy for you to remember.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              New Password
            </label>

            <div className="relative">
              <FiKey className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-full border border-[#49BBBD]/40 pl-12 pr-12 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Confirm Password
            </label>

            <div className="relative">
              <FiKey className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-full border border-[#49BBBD]/40 pl-12 pr-12 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/60"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div className="text-left bg-slate-50 rounded-2xl p-4 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-700">
              Password requirements
            </p>

            <p
              className={`text-[11px] ${
                password.length >= 8 ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              ✓ At least 8 characters
            </p>

            <p
              className={`text-[11px] ${
                password && password === confirmPassword
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              ✓ Passwords match
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password || !confirmPassword}
            className="w-full rounded-full bg-[#49BBBD] hover:bg-[#3cb0b2] active:scale-95 text-white font-semibold text-sm py-3 px-8 shadow-lg shadow-[#49BBBD]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100">
          <Link
            to="/login"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
