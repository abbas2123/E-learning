import type { CourseStatus } from "../types/instructor.types";
import { Clock, CheckCircle2, AlertCircle, FileEdit, Archive } from "lucide-react";

interface CourseStatusBadgeProps {
  status: CourseStatus;
}

export function CourseStatusBadge({ status }: CourseStatusBadgeProps) {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 size={13} />
          Published
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 animate-pulse">
          <Clock size={13} />
          Pending Review
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
          <AlertCircle size={13} />
          Action Needed (Rejected)
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400 border border-slate-700">
          <Archive size={13} />
          Archived
        </span>
      );
    case "draft":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300 border border-slate-700">
          <FileEdit size={13} />
          Draft
        </span>
      );
  }
}
