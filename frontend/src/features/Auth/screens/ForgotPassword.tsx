import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiKey, FiLoader, FiMail } from "react-icons/fi";
import { toast } from "sonner";
import { forgotPassword } from "../../../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({
        email: trimmedEmail,
      });

      toast.success("OTP sent successfully", {
        description: "Check your email for the verification code.",
      });

      navigate("/verify-otp", {
        state: {
          email: trimmedEmail,
          purpose: "PASSWORD_RESET",
        },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send OTP. Please try again.";

      setErrorMessage(message);

      toast.error("Unable to send OTP", {
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
        <div className="mx-auto w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 text-3xl shadow-inner">
          <FiKey />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Forgot Password?
          </h1>

          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter your registered email address and we'll send you a
            verification code to reset your password.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-full border border-[#49BBBD]/40 pl-12 pr-5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#49BBBD] hover:bg-[#3cb0b2] active:scale-95 text-white font-semibold text-sm py-3 px-8 shadow-lg shadow-[#49BBBD]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <FiKey className="w-4 h-4" />
                <span>Send OTP</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100">
          <Link
            to="/login"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700"
          >
            Remember your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
