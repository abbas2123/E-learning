import type { InstructorCourseSummary } from "../types/instructor.types";
import { CheckCircle2, XCircle, Send, Loader2 } from "lucide-react";

interface SubmissionChecklistProps {
  course: InstructorCourseSummary;
  sectionCount: number;
  lessonCount: number;
  quizCount: number;
  onSubmit: () => void;
  submitting: boolean;
}

export function SubmissionChecklist({
  course,
  sectionCount,
  lessonCount,
  quizCount,
  onSubmit,
  submitting,
}: SubmissionChecklistProps) {
  const items = [
    { label: "Course Title & Description", ok: Boolean(course.title && course.description) },
    { label: "Category & Level configured", ok: Boolean(course.category && course.level) },
    { label: "Pricing configured (₹ INR)", ok: typeof course.price === "number" && course.price >= 0 },
    { label: "At least 1 Curriculum Section", ok: sectionCount > 0 },
    { label: "At least 1 Lesson added", ok: lessonCount > 0 },
    { label: "Assessment & Knowledge Quizzes", ok: quizCount > 0 },
  ];

  const completedCount = items.filter((i) => i.ok).length;
  const isReady =
    Boolean(course.title && course.description && course.category && course.level) &&
    sectionCount > 0 &&
    lessonCount > 0 &&
    course.status !== "pending" &&
    course.status !== "published";

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Course Submission Readiness</h3>
          <p className="text-xs text-slate-400">
            Complete all requirements before submitting your course for admin review.
          </p>
        </div>
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/30">
          {completedCount} / {items.length} Ready
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-xl border p-3.5 text-xs font-semibold ${
              item.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-slate-800 bg-slate-950/60 text-slate-400"
            }`}
          >
            {item.ok ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <XCircle size={16} className="text-slate-500 shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-300 flex items-center justify-between">
        <div>
          <strong className="block font-bold text-white mb-0.5">Course Completion & Certificate Passing Score:</strong>
          <span>Students must score at least {course.minCertificateScore ?? 70}% on assessments to unlock their certificate.</span>
        </div>
        <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          {course.minCertificateScore ?? 70}% Min
        </span>
      </div>

      {course.rejectionReason && course.status === "rejected" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <strong className="block font-bold mb-1">Previous Admin Rejection Reason:</strong>
          <p>{course.rejectionReason}</p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isReady || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {course.status === "pending"
            ? "Course Pending Admin Review"
            : course.status === "published"
              ? "Course Published"
              : "Submit Course for Admin Review"}
        </button>
      </div>
    </div>
  );
}
