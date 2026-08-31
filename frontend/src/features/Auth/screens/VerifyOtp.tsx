import { useState, useEffect, type FormEvent } from "react";
import { useLocation, useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FiLoader, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";

export default function VerifyOtp() {
  const { isLoggedIn, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email passed from Register or Login redirection
  const emailFromState = location.state?.email || "";
  const purpose = location.state?.purpose || "EMAIL_VERIFICATION";
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend countdown timer state (60s)
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // If already logged in & verified, redirect to Home
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
        purpose,
      });

      // Password reset flow
      if (result.type === "PASSWORD_RESET") {
        navigate("/reset-password", {
          state: {
            resetToken: result.resetToken,
          },
        });

        return;
      }

      // Email verification flow
      if (result.user.role === "instructor" || result.user.role === "admin") {
        toast.success(`Email verified! Welcome to Instructor Studio, ${result.user.name} 👨‍🏫`, {
          description: "Your instructor account is now active.",
        });
        navigate("/instructor/dashboard", { replace: true });
        return;
      }

      toast.success(`Email verified! Welcome, ${result.user.name} 🎉`, {
        description: "Your account is now fully active. Enjoy learning!",
      });

      navigate("/", { replace: true });
    } catch (err: any) {
      const message =
        err?.message ||
        "OTP verification failed. Please check the code and try again.";

      setErrorMessage(message);

      toast.error("Verification failed", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      toast.error("Email required", {
        description: "Please enter your email first.",
      });
      return;
    }

    setIsResending(true);
    setErrorMessage(null);

    try {
      await resendOtp(email.trim());
      setResendTimer(60);
      toast.success("OTP code resent!", {
        description:
          "Please check your inbox or backend console logs for the new code.",
      });
    } catch (err: any) {
      const message = err?.message || "Failed to resend OTP code.";
      setErrorMessage(message);
      toast.error("Resend failed", { description: message });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <Link
        to="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-white transition-all z-20"
      >
        ← Back to Home
      </Link>

      <div className="w-full max-w-md bg-white rounded-[36px] shadow-2xl p-8 sm:p-10 border border-slate-100 space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 text-3xl shadow-inner">
          <FiCheckCircle />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">
            {purpose === "PASSWORD_RESET"
              ? "Verify Your Email"
              : "Verify Email OTP"}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-slate-800">
              {email || "your email"}
            </span>{" "}
            to verify your identity.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!emailFromState && (
            <div className="text-left space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-[#49BBBD]/40 px-5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/60"
              />
            </div>
          )}

          <div className="text-left space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-full border border-[#49BBBD]/40 px-5 py-3 text-center tracking-[0.4em] text-lg font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/60"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length < 6}
            className="w-full rounded-full bg-[#49BBBD] hover:bg-[#3cb0b2] active:scale-95 text-white font-semibold text-sm py-3 px-8 shadow-lg shadow-[#49BBBD]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Verifying OTP...</span>
              </>
            ) : (
              "Verify OTP & Continue"
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || isResending}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 disabled:text-slate-400 transition"
          >
            <FiRefreshCw className={isResending ? "animate-spin" : ""} />
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
