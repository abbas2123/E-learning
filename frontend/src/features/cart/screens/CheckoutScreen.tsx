import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService } from "../../../services/paymentService";
import { getCoursesId } from "../../course/service/courseService";
import type { Course } from "../../course/types/course.types";
import { cartService } from "../../../services/cartService";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Loader2,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────
async function loadRazorpayScript(): Promise<boolean> {
  if ((window as any).Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── component ──────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // single-course mode
  const courseId = searchParams.get("courseId");
  // multi-course mode (comma-separated)
  const courseIdsParam = searchParams.get("courseIds");
  const courseIds = courseIdsParam ? courseIdsParam.split(",").filter(Boolean) : [];

  const isMulti = courseIds.length > 1;

  const [course, setCourse] = useState<Course | null>(null);
  const [multiCourses, setMultiCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // ── load course data ──
  useEffect(() => {
    if (isMulti) {
      // Fetch all cart courses in parallel
      Promise.all(courseIds.map((id) => getCoursesId(id)))
        .then(setMultiCourses)
        .catch(() => toast.error("Failed to load cart courses."))
        .finally(() => setLoading(false));
    } else if (courseId) {
      getCoursesId(courseId)
        .then(setCourse)
        .catch(() => toast.error("Course load failed."))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [courseId, courseIdsParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPrice = isMulti
    ? multiCourses.reduce((sum, c) => sum + c.price, 0)
    : course?.price ?? 0;

  // ── Single-course payment ──
  const handleSinglePay = async () => {
    if (!courseId || !course) return;
    setPaying(true);
    try {
      const order = await paymentService.createOrder(courseId);
      const loaded = await loadRazorpayScript();

      if (!loaded || !(window as any).Razorpay) {
        // Fallback for test environments
        await paymentService.verifyPayment({
          courseId,
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
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment({
              courseId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`Welcome to "${order.courseTitle}" 🎉`);
            navigate("/my-learning");
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.");
          }
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment.");
    } finally {
      setPaying(false);
    }
  };

  // ── Multi-course payment ──
  const handleMultiPay = async () => {
    if (courseIds.length === 0) return;
    setPaying(true);
    try {
      const order = await paymentService.createMultiOrder(courseIds);
      const loaded = await loadRazorpayScript();

      if (!loaded || !(window as any).Razorpay) {
        // Fallback for test environments
        await paymentService.verifyMultiPayment({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_signature: "dummy_sig",
        });
        cartService.clearCart();
        toast.success(`Enrolled in ${order.courses.length} courses 🎉`);
        navigate("/my-learning");
        return;
      }

      const courseNames = order.courses.map((c) => c.title).join(", ");
      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency || "INR",
        name: "TOTC E-Learning Platform",
        description: `Enrollment for ${order.courses.length} courses`,
        notes: { courses: courseNames },
        order_id: order.orderId,
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
            toast.error(err.message || "Payment verification failed.");
          }
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment.");
    } finally {
      setPaying(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  // ── No course selected ──
  if (!isMulti && !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">No Course Selected</h2>
          <p className="mt-1 text-sm text-slate-500">
            Please select a course to proceed to checkout.
          </p>
          <button
            type="button"
            onClick={() => navigate("/course")}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete your order and unlock instant access to your{" "}
            {isMulti ? "courses" : "course"}.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Billing info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Billing Information
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  defaultValue="TOTC Learner"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600">
                  Country
                </label>
                <input
                  type="text"
                  defaultValue="India (INR)"
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600 font-semibold"
                />
              </div>
            </div>

            {/* Guarantee */}
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-50 p-4 text-xs font-medium text-indigo-700">
              <ShieldCheck size={18} className="shrink-0" />
              All purchases are covered by our 30-day money-back guarantee.
            </div>

            {/* What you get */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                What you get
              </p>
              {[
                "Full lifetime access",
                "Certificate of completion",
                "Access on mobile and desktop",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              {isMulti ? `${multiCourses.length} Courses Selected` : "Course Selected"}
            </h2>

            {/* Course list */}
            <div className="mt-4 space-y-4 border-b border-slate-100 pb-4">
              {isMulti
                ? multiCourses.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="h-12 w-16 shrink-0 rounded-lg object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                          <BookOpen size={16} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-bold text-slate-900">
                          {c.title}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                          ₹{c.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))
                : course && (
                    <div className="flex gap-3">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-16 w-20 rounded-lg object-cover bg-slate-100"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-bold text-slate-900">
                          {course.title}
                        </p>
                        <span className="mt-1 inline-block text-[10px] font-bold text-indigo-600">
                          {course.category}
                        </span>
                      </div>
                    </div>
                  )}
            </div>

            {/* Price breakdown */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between font-bold text-slate-900 text-base">
                <span>Total Amount</span>
                <span className="text-indigo-600">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Pay button */}
            <button
              type="button"
              onClick={isMulti ? handleMultiPay : handleSinglePay}
              disabled={paying}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {paying ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              {paying
                ? "Processing..."
                : `Pay ₹${totalPrice.toLocaleString("en-IN")} via Razorpay`}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secure 256-bit SSL Payment
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
