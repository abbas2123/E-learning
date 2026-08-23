import { useEffect, useState } from "react";
import { Star, MessageSquare, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import reviewService, {
  type Review,
  type CourseReviewsData,
} from "../../../services/reviewService";

interface CourseReviewsSectionProps {
  courseId: string;
  isEnrolled?: boolean;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={24}
            className={
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }
            fill={star <= (hovered || value) ? "#fbbf24" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
          {review.studentAvatar ? (
            <img
              src={review.studentAvatar}
              alt={review.studentName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            review.studentName.charAt(0).toUpperCase()
          )}
        </div>
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-800">{review.studentName}</span>
            <span className="text-xs text-slate-400">
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {/* Stars */}
          <div className="mt-1 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                fill={s <= review.rating ? "#fbbf24" : "none"}
                className={s <= review.rating ? "text-amber-400" : "text-slate-300"}
              />
            ))}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}

export default function CourseReviewsSection({
  courseId,
  isEnrolled = false,
}: CourseReviewsSectionProps) {
  const [data, setData] = useState<CourseReviewsData | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    reviewService
      .getCourseReviews(courseId)
      .then(setData)
      .catch(() => toast.error("Failed to load reviews."))
      .finally(() => setLoadingReviews(false));
  }, [courseId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a review comment.");
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await reviewService.createReview({ courseId, rating, comment });
      setData((prev) =>
        prev
          ? {
              reviews: [newReview, ...prev.reviews],
              averageRating: Number(
                (
                  (prev.averageRating * prev.totalReviews + rating) /
                  (prev.totalReviews + 1)
                ).toFixed(1),
              ),
              totalReviews: prev.totalReviews + 1,
            }
          : null,
      );
      setRating(0);
      setComment("");
      toast.success("Review submitted! Thank you.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Student Feedback
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Reviews & Ratings
          </h2>
        </div>

        {/* Aggregate */}
        {data && data.totalReviews > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3">
            <span className="text-3xl font-bold text-amber-500">{data.averageRating}</span>
            <div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    fill={s <= Math.round(data.averageRating) ? "#fbbf24" : "none"}
                    className={
                      s <= Math.round(data.averageRating)
                        ? "text-amber-400"
                        : "text-slate-300"
                    }
                  />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-amber-700">
                {data.totalReviews} review{data.totalReviews > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Write a Review (enrolled users only) */}
      {isEnrolled && (
        <div className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
            <MessageSquare size={16} className="text-indigo-500" />
            Write a Review
          </h3>

          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-slate-600">Your Rating</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-slate-600">Your Review</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this course..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* Reviews List */}
      {loadingReviews ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 size={26} className="animate-spin text-indigo-400" />
        </div>
      ) : !data || data.reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <MessageSquare size={24} className="text-slate-400" />
          </div>
          <p className="font-medium text-slate-600">No reviews yet</p>
          <p className="text-sm text-slate-400">
            {isEnrolled
              ? "Be the first to leave a review!"
              : "Enroll in this course to leave a review."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
