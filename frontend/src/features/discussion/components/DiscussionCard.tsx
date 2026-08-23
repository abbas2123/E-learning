import React from "react";
import type { Discussion } from "../../../services/discussionService";

interface DiscussionCardProps {
  discussion: Discussion;
  onClick: () => void;
  onResolve?: (e: React.MouseEvent) => void;
  onPin?: (e: React.MouseEvent) => void;
  currentUserId?: string;
  isInstructor?: boolean;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  onClick,
  onResolve,
  onPin,
  currentUserId,
  isInstructor,
}) => {
  const isAuthor = discussion.studentId === currentUserId;
  const canResolve = isAuthor || isInstructor;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
        discussion.isPinned
          ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/50"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-500/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {discussion.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              📌 Pinned
            </span>
          )}

          {discussion.status === "resolved" && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
              ✓ Resolved
            </span>
          )}

          {discussion.status === "answered" && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
              Instructor Answered
            </span>
          )}

          {discussion.status === "locked" && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              🔒 Locked
            </span>
          )}

          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base line-clamp-1">
            {discussion.title}
          </h4>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isInstructor && onPin && (
            <button
              onClick={onPin}
              title={discussion.isPinned ? "Unpin question" : "Pin question"}
              className={`p-1.5 rounded-lg transition-colors text-sm ${
                discussion.isPinned
                  ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40"
                  : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              📌
            </button>
          )}

          {canResolve && onResolve && discussion.status !== "locked" && (
            <button
              onClick={onResolve}
              title={discussion.status === "resolved" ? "Mark as Open" : "Mark as Resolved"}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                discussion.status === "resolved"
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700"
              }`}
            >
              {discussion.status === "resolved" ? "Reopen" : "✓ Resolve"}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
        {discussion.question}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          {discussion.author?.avatar ? (
            <img
              src={discussion.author.avatar}
              alt={discussion.author.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-[10px]">
              {discussion.author?.name ? discussion.author.name[0].toUpperCase() : "U"}
            </div>
          )}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {discussion.author?.name || "Student"}
          </span>
          {discussion.author?.role === "instructor" && (
            <span className="bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 px-1.5 py-0.2 rounded font-semibold text-[10px]">
              Instructor
            </span>
          )}
          <span>•</span>
          <span>{formatDate(discussion.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>{discussion.replyCount} {discussion.replyCount === 1 ? "reply" : "replies"}</span>
        </div>
      </div>
    </div>
  );
};
