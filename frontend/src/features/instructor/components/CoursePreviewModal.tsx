import type { InstructorCourseSummary } from "../types/instructor.types";
import type { CourseSection } from "../../course/types/course.types";
import {
  X,
  BookOpen,
  Clock,
  Star,
  Video,
  FileText,
  HelpCircle,
} from "lucide-react";
import { CourseStatusBadge } from "./CourseStatusBadge";

interface CoursePreviewModalProps {
  course: InstructorCourseSummary;
  sections: CourseSection[];
  onClose: () => void;
}

export function CoursePreviewModal({
  course,
  sections,
  onClose,
}: CoursePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-2xl space-y-6 p-4 sm:p-6 md:p-8">
        {/* Modal Top Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="rounded-xl bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/30">
              Instructor Course Preview (Read Only)
            </span>
            <CourseStatusBadge status={course.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Course Banner Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-2xl font-extrabold text-white">
              {course.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star size={14} className="fill-amber-400" /> {course.rating} (
                {course.reviewCount} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-slate-400" /> {course.duration}{" "}
                mins total
              </span>
              <span className="capitalize rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold">
                {course.level}
              </span>
              <span className="font-extrabold text-indigo-400">
                {course.price > 0 ? `₹${course.price}` : "Free"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-36 w-full object-cover rounded-xl border border-slate-800"
              />
            ) : (
              <div className="flex h-36 w-full items-center justify-center rounded-xl bg-slate-800 text-slate-500">
                <BookOpen size={32} />
              </div>
            )}
          </div>
        </div>

        {/* Curriculum Outline */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Curriculum Structure ({sections.length} Sections)
          </h3>

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-400">
                    Section {idx + 1}: {sec.title}
                  </span>
                  <span className="text-slate-500">
                    {sec.lessons?.length || 0} items
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  {sec.lessons?.map((les) => (
                    <div
                      key={les.id}
                      className="flex items-center justify-between text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900/60 border border-slate-850"
                    >
                      <div className="flex items-center gap-2.5">
                        {les.type === "video" ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
                            <Video size={13} />
                          </div>
                        ) : les.type === "quiz" ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                            <HelpCircle size={13} />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-slate-400">
                            <FileText size={13} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {les.title}
                            </span>
                            {les.type === "quiz" && (
                              <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20">
                                Quiz{" "}
                                {les.questionCount
                                  ? `(${les.questionCount} Qs)`
                                  : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {les.duration}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
