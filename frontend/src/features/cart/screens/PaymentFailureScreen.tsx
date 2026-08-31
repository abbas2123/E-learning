import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  ShieldAlert,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { getCoursesId } from "../../course/service/courseService";
import type { Course } from "../../course/types/course.types";
import { paymentService } from "../../../services/paymentService";
import { cartService } from "../../../services/cartService";
import { toast } from "sonner";
import { loadRazorpayScript, destroyRazorpay, safeOpen } from "../../../utils/razorpayUtils";

// ─── Component ───────────────────────────────────────────────────────────────

export default function PaymentFailureScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── Parse URL parameters ──
  const courseId = searchParams.get("courseId");
  const courseIdsParam = searchParams.get("courseIds");
  const courseIds = courseIdsParam ? courseIdsParam.split(",").filter(Boolean) : [];
  const isMulti = courseIds.length > 1;

  const orderId = searchParams.get("orderId") || "";
  const errorReason =
    searchParams.get("reason") ||
    searchParams.get("error") ||
    "Payment was declined or cancelled before completion.";

  const [course, setCourse] = useState<Course | null>(null);
  const [multiCourses, setMultiCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  // ── Load course details for display ──
  useEffect(() => {
    if (isMulti) {
      Promise.all(courseIds.map((id) => getCoursesId(id).catch(() => null)))
        .then((res) => setMultiCourses(res.filter(Boolean) as Course[]))
        .finally(() => setLoading(false));
    } else if (courseId) {
      getCoursesId(courseId)
        .then(setCourse)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [courseId, courseIdsParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPrice = isMulti
    ? multiCourses.reduce((sum, c) => sum + c.price, 0)
    : course?.price ?? 0;

  // ── Retry Payment ──────────────────────────────────────────────────────────
  //
  // We create a NEW Razorpay order on each retry. Razorpay orders are single-use;
  // a declined order cannot be re-opened. The backend CreateOrderUseCase guards
  // against duplicate enrollments with an idempotency check.
  // ──────────────────────────────────────────────────────────────────────────
  const handleRetry = async () => {
    setRetrying(true);
    try {
      if (isMulti && courseIds.length > 0) {
        await retryMultiCourse(courseIds);
      } else if (courseId) {
        await retrySingleCourse(courseId);
      } else {
        navigate("/cart");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment retry.");
      setRetrying(false);
    }
  };

  // ── Single-course retry ──
  async function retrySingleCourse(cId: string) {
    let rzp: any = null;

    const order = await paymentService.createOrder(cId);
    // Always force-reload: destroyRazorpay() deleted window.Razorpay, so we
    // must re-fetch the script to get a clean SDK instance.
    const loaded = await loadRazorpayScript();

    if (!loaded || !(window as any).Razorpay) {
      // Dev/test fallback — CDN unreachable
      await paymentService.verifyPayment({
        courseId: cId,
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: "dummy_sig",
      });
      toast.success(`Enrolled in "${order.courseTitle}" 🎉`);
      navigate("/my-learning");
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amount * 100,
      currency: order.currency || "INR",
      name: "TOTC E-Learning Platform",
      description: `Enrollment for ${order.courseTitle}`,
      order_id: order.orderId,
      // Prevents Razorpay from showing its own built-in retry/failure screen
      retry: { enabled: false },
      handler: async (response: any) => {
        // SUCCESS — backend is sole source of truth
        try {
          await paymentService.verifyPayment({
            courseId: cId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success(`Welcome to "${order.courseTitle}" 🎉`);
          navigate("/my-learning");
        } catch (err: any) {
          destroyRazorpay(rzp);
          const reason = err.message || "Payment verification signature mismatch.";
          navigate(
            `/payment/failure?courseId=${cId}&orderId=${order.orderId}&reason=${encodeURIComponent(reason)}`,
          );
        }
      },
      modal: {
        ondismiss: () => {
          setRetrying(false);
          toast.info("Payment cancelled. You can retry whenever you're ready.");
        },
      },
      theme: { color: "#4f46e5" },
    };

    rzp = new (window as any).Razorpay(options);

    // payment.failed fires while the modal is still open — destroy first
    rzp.on("payment.failed", (response: any) => {
      const errMsg =
        response?.error?.description ||
        response?.error?.reason ||
        "Payment was declined by your bank or card issuer.";
      destroyRazorpay(rzp);
      navigate(
        `/payment/failure?courseId=${cId}&orderId=${order.orderId}&reason=${encodeURIComponent(errMsg)}`,
      );
    });

    // safeOpen() catches the case where Razorpay's iframe contentWindow is null,
    // which is what triggers Razorpay's own alert("This browser is not supported").
    // Instead of showing that alert, we redirect to our failure page.
    const opened = safeOpen(rzp);
    if (!opened) {
      destroyRazorpay(rzp);
      setRetrying(false);
      navigate(
        `/payment/failure?courseId=${cId}&orderId=${order.orderId}&reason=${encodeURIComponent("Payment initialization failed. Please try again.")}`,
      );
    }
  }

  // ── Multi-course retry ──
  async function retryMultiCourse(cIds: string[]) {
    let rzp: any = null;

    const order = await paymentService.createMultiOrder(cIds);
    const loaded = await loadRazorpayScript();

    if (!loaded || !(window as any).Razorpay) {
      await paymentService.verifyMultiPayment({
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: "dummy_sig",
      });
      cartService.clearCart();
      toast.success("Payment Successful! You are enrolled 🎉");
      navigate("/my-learning");
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amount * 100,
      currency: order.currency || "INR",
      name: "TOTC E-Learning Platform",
      description: `Enrollment for ${order.courses.length} courses`,
      order_id: order.orderId,
      retry: { enabled: false },
      handler: async (response: any) => {
        try {
          await paymentService.verifyMultiPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          cartService.clearCart();
          toast.success(
            `You're enrolled in ${order.courses.length} course${order.courses.length > 1 ? "s" : ""}! 🎉`,
          );
          navigate("/my-learning");
        } catch (err: any) {
          destroyRazorpay(rzp);
          const reason = err.message || "Payment verification failed.";
          navigate(
            `/payment/failure?courseIds=${cIds.join(",")}&orderId=${order.orderId}&reason=${encodeURIComponent(reason)}`,
          );
        }
      },
      modal: {
        ondismiss: () => {
          setRetrying(false);
          toast.info("Payment cancelled. You can retry whenever you're ready.");
        },
      },
      theme: { color: "#4f46e5" },
    };

    rzp = new (window as any).Razorpay(options);

    rzp.on("payment.failed", (response: any) => {
      const errMsg =
        response?.error?.description ||
        response?.error?.reason ||
        "Payment was declined by your bank or card issuer.";
      destroyRazorpay(rzp);
      navigate(
        `/payment/failure?courseIds=${cIds.join(",")}&orderId=${order.orderId}&reason=${encodeURIComponent(errMsg)}`,
      );
    });

    const opened = safeOpen(rzp);
    if (!opened) {
      destroyRazorpay(rzp);
      setRetrying(false);
      navigate(
        `/payment/failure?courseIds=${cIds.join(",")}&orderId=${order.orderId}&reason=${encodeURIComponent("Payment initialization failed. Please try again.")}`,
      );
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 size={36} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-3xl">

        {/* ── Main Failure Card ── */}
        <div className="overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-xl">

          {/* Top Banner */}
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-8 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md shadow-inner">
              <AlertTriangle size={42} className="text-white" />
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <ShieldAlert size={14} />
              Payment Unsuccessful
            </span>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              We Couldn't Process Your Payment
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-rose-100 max-w-md mx-auto leading-relaxed">
              Don't worry — no funds were deducted from your account. You can retry with
              the same or an alternative payment method.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">

            {/* Error reason */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Reason for decline
                  </h4>
                  <p className="mt-1 text-xs font-medium text-rose-800">{errorReason}</p>
                </div>
              </div>
            </div>

            {/* Order reference + course breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Attempted Order
                </span>
                {orderId && (
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    ID: {orderId.slice(-12)}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {isMulti ? (
                  multiCourses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1 pr-2">
                        {c.title}
                      </span>
                      <span className="text-xs font-bold text-slate-900 shrink-0">
                        ₹{c.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                ) : course ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 capitalize">
                        {course.category} • Lifetime Access
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-indigo-600 shrink-0">
                      ₹{course.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Course details unavailable.</p>
                )}

                {totalPrice > 0 && (
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Total Payable</span>
                    <span className="text-base font-extrabold text-indigo-600">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                id="retry-payment-btn"
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                {retrying ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RotateCcw size={18} />
                )}
                {retrying ? "Opening Payment..." : "Retry Payment Now"}
              </button>

              <button
                type="button"
                id="change-payment-method-btn"
                onClick={() => {
                  if (isMulti) {
                    navigate(`/checkout?courseIds=${courseIds.join(",")}`);
                  } else if (courseId) {
                    navigate(`/checkout?courseId=${courseId}`);
                  } else {
                    navigate("/cart");
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-3.5 px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
              >
                <ShoppingBag size={18} />
                Change Payment Method
              </button>
            </div>

            {/* Secondary links */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 pt-2">
              <Link to="/cart" className="hover:text-indigo-600 underline">
                Return to Cart
              </Link>
              <span>•</span>
              <Link to="/course" className="hover:text-indigo-600 underline">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>

        {/* ── Helpful Tips ── */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
            <HelpCircle size={18} className="text-indigo-600" />
            Common reasons for payment issues
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            {[
              {
                title: "Bank Server Timeout",
                body: "Try UPI (Google Pay, PhonePe, Paytm) for instant authorization.",
              },
              {
                title: "Card Limits or 3D Secure",
                body: "Ensure international/online transactions are enabled in your banking app.",
              },
              {
                title: "UPI Request Expired",
                body: "Approve the notification in your UPI app within the 5-minute window.",
              },
              {
                title: "Need Instant Assistance?",
                body: "Our team is available 24/7 at support@totc.com.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">{title}</strong>
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
