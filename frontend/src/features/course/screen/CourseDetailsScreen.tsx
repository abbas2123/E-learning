import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Globe2,
  GraduationCap,
  Heart,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getCoursesId } from "../service/courseService";
import { paymentService } from "../../../services/paymentService";
import reviewService, { type CourseReviewsData } from "../../../services/reviewService";
import wishlistService from "../../../services/wishlistService";
import { useAuth } from "../../../context/AuthContext";
import CourseReviewsSection from "../components/CourseReviewsSection";
import type { Course } from "../types/course.types";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: "video" | "text" | "quiz";
  isPreview?: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

const defaultCourseSections: CourseSection[] = [
  {
    id: "section-1",
    title: "Introduction & Foundations",
    lessons: [
      {
        id: "lesson-1",
        title: "Welcome & Course Roadmap",
        duration: 8,
        type: "video",
        isPreview: true,
      },
      {
        id: "lesson-2",
        title: "Environment Setup & Prerequisites",
        duration: 14,
        type: "video",
      },
    ],
  },
  {
    id: "section-2",
    title: "Core Concepts & Architecture",
    lessons: [
      {
        id: "lesson-3",
        title: "Core Architecture & Data Flow",
        duration: 22,
        type: "video",
      },
      {
        id: "lesson-4",
        title: "Practical Exercises & Hands-on Project",
        duration: 30,
        type: "quiz",
      },
    ],
  },
];

const CourseDetailsScreen = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    defaultCourseSections[0].id,
  ]);

  // Reviews aggregate (loaded eagerly for hero display)
  const [reviewsData, setReviewsData] = useState<CourseReviewsData | null>(null);

  // Wishlist state
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      try {
        const data = await getCoursesId(courseId);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    reviewService.getCourseReviews(courseId).then(setReviewsData).catch(() => {});
  }, [courseId]);

  const handleEnroll = async () => {
    if (!courseId) return;
    if (!isLoggedIn) {
      toast.error("Please log in to enroll.");
      navigate("/login");
      return;
    }
    setEnrolling(true);
    try {
      const order = await paymentService.createOrder(courseId);

      const isScriptLoaded = await new Promise<boolean>((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!isScriptLoaded || !(window as any).Razorpay) {
        await paymentService.verifyPayment({
          courseId,
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_signature: "dummy_sig",
        });
        toast.success(`Enrolled in "${order.courseTitle}"!`);
        navigate("/profile");
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency || "INR",
        name: "TOTC Learning Platform",
        description: `Enrollment for ${order.courseTitle}`,
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment({
              courseId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`Payment Verified! Welcome to "${order.courseTitle}" 🎉`);
            navigate("/profile");
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.");
          }
        },
        theme: { color: "#4f46e5" },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to initialize enrollment",
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!courseId) return;
    if (!isLoggedIn) {
      toast.error("Please log in to use wishlist.");
      navigate("/login");
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(courseId);
        setInWishlist(false);
        toast.success("Removed from wishlist.");
      } else {
        await wishlistService.addToWishlist(courseId);
        setInWishlist(true);
        toast.success("Added to wishlist!");
      }
    } catch (err: any) {
      toast.error(err.message || "Wishlist action failed.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  const category = course?.category || "Development";
  const title = course?.title || "Course Details";
  const description =
    course?.description ||
    "Master key industry skills with step-by-step practical guides, assignments, and real-world projects.";
  const price = course?.price ?? 49;
  const level = course?.level || "Beginner";
  const language = course?.language || "English";
  const thumbnail =
    course?.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085";
  const duration = course?.duration || 12;

  const avgRating = reviewsData?.averageRating ?? 4.9;
  const totalReviews = reviewsData?.totalReviews ?? 0;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
            {/* Hero information */}
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
                <span className="cursor-pointer hover:text-white" onClick={() => navigate("/course")}>Courses</span>
                <span>/</span>
                <span className="text-slate-300">{category}</span>
              </div>

              {/* Category */}
              <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                {category}
              </span>

              {/* Title */}
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {title}
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                {description}
              </p>

              {/* Rating */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">{avgRating}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= Math.round(avgRating) ? "#fbbf24" : "none"}
                        className={s <= Math.round(avgRating) ? "text-amber-400" : "text-slate-600"}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400">
                    {totalReviews > 0 ? `(${totalReviews} reviews)` : "(Top Rated)"}
                  </span>
                </div>
                <span className="hidden text-slate-600 sm:block">•</span>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users size={17} />
                  Active Learners Enrolled
                </div>
              </div>

              {/* Stats */}
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 capitalize">
                  <GraduationCap size={17} />
                  {level}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <Clock3 size={17} />
                  {duration} hours
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <BookOpen size={17} />
                  Full Curriculum
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <Globe2 size={17} />
                  {language}
                </div>
              </div>

              <p className="mt-7 text-sm text-slate-500">
                Published by <span className="font-semibold text-slate-300">TOTC Platform</span>
              </p>
            </div>

            {/* Enrollment card */}
            <div className="lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
                <div className="relative h-56 overflow-hidden">
                  <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    <PlayCircle size={14} />
                    Preview course
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-6">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      ₹{price}
                    </span>
                    {price > 0 && (
                      <span className="mb-1 text-sm text-slate-400 line-through">
                        ₹{price * 2}
                      </span>
                    )}
                    <span className="mb-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                      Special Offer
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    One-time payment • Lifetime access
                  </p>

                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </button>

                  {/* Wishlist button */}
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
                      inWishlist
                        ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={inWishlist ? "currentColor" : "none"}
                      className={inWishlist ? "text-rose-500" : "text-slate-500"}
                    />
                    {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    30-day money-back guarantee
                  </p>

                  {/* Includes */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-sm font-bold text-slate-900">This course includes</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <PlayCircle size={17} className="text-indigo-500" />
                        {duration} hours of video content
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <FileText size={17} className="text-indigo-500" />
                        Downloadable resources
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <BookOpen size={17} className="text-indigo-500" />
                        Hands-on practical modules
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <GraduationCap size={17} className="text-indigo-500" />
                        Course completion certificate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            {/* What you'll learn */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  Course outcomes
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  What you'll learn
                </h2>
              </div>

              <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  `Master fundamental concepts in ${category}`,
                  "Build production-grade applications",
                  "Understand best architecture practices",
                  "Implement security and authorization patterns",
                  "Deploy projects to cloud environments",
                  "Gain hands-on practical experience",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="mt-10">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  Curriculum
                </p>
                <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      Course content
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Comprehensive modules & lessons
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections(
                        openSections.length === defaultCourseSections.length
                          ? []
                          : defaultCourseSections.map((s) => s.id),
                      )
                    }
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {openSections.length === defaultCourseSections.length
                      ? "Collapse all"
                      : "Expand all"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {defaultCourseSections.map((section, index) => {
                  const isOpen = openSections.includes(section.id);
                  const totalDuration = section.lessons.reduce(
                    (total, lesson) => total + lesson.duration,
                    0,
                  );

                  return (
                    <div
                      key={section.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900">{section.title}</h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {section.lessons.length} lessons • {formatDuration(totalDuration)}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 rounded-full border border-slate-200 p-1.5 text-slate-400">
                          {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                  {lesson.type === "video" && <PlayCircle size={17} />}
                                  {lesson.type === "text" && <FileText size={17} />}
                                  {lesson.type === "quiz" && <BookOpen size={17} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-700">
                                    {lesson.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs capitalize text-slate-400">
                                      {lesson.type}
                                    </span>
                                    {lesson.isPreview && (
                                      <span className="text-xs font-semibold text-emerald-600">
                                        • Preview
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                                <Clock3 size={14} />
                                {lesson.duration} min
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reviews Section */}
            {courseId && (
              <CourseReviewsSection
                courseId={courseId}
                isEnrolled={isLoggedIn}
              />
            )}
          </div>

          {/* Aside */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Course overview
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 line-clamp-2">{title}</h3>

              <div className="mt-6 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Level</span>
                  <span className="font-semibold text-slate-900 capitalize">{level}</span>
                </div>
                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-900">{duration} hours</span>
                </div>
                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Language</span>
                  <span className="font-semibold text-slate-900">{language}</span>
                </div>
                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Rating</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star size={13} fill="#f59e0b" />
                    {avgRating} ({totalReviews})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrolling}
                className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {enrolling ? "Enrolling..." : `Enroll for ₹${price}`}
              </button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  inWishlist
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Heart
                  size={15}
                  fill={inWishlist ? "currentColor" : "none"}
                  className={inWishlist ? "text-rose-500" : "text-slate-500"}
                />
                {inWishlist ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default CourseDetailsScreen;
