import React, { useEffect, useState } from "react";
import discussionService from "../../../services/discussionService";
import type {
  Discussion,
  PaginatedDiscussions,
} from "../../../services/discussionService";
import { DiscussionCard } from "./DiscussionCard";
import { AskQuestionModal } from "./AskQuestionModal";
import { DiscussionThreadModal } from "./DiscussionThreadModal";

interface LessonDiscussionTabProps {
  courseId: string;
  lessonId?: string | null;
  lessonTitle?: string;
  currentUserId?: string;
  currentUserRole?: string;
}

export const LessonDiscussionTab: React.FC<LessonDiscussionTabProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  currentUserId,
  currentUserRole,
}) => {
  const [data, setData] = useState<PaginatedDiscussions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<"lesson" | "course">("lesson");

  // Modals
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

  useEffect(() => {
    loadDiscussions();
  }, [courseId, lessonId, page, statusFilter, scope]);

  const loadDiscussions = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);

      let res: PaginatedDiscussions;
      if (searchQuery.trim()) {
        res = await discussionService.searchDiscussions(courseId, searchQuery.trim(), page, 10);
      } else if (scope === "lesson" && lessonId) {
        res = await discussionService.getLessonDiscussions(courseId, lessonId, page, 10);
      } else {
        res = await discussionService.getCourseDiscussions(
          courseId,
          page,
          10,
          statusFilter !== "all" ? statusFilter : undefined,
        );
      }
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load discussions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDiscussions();
  };

  const handleAskQuestion = async (title: string, question: string) => {
    await discussionService.createDiscussion(
      courseId,
      title,
      question,
      scope === "lesson" ? lessonId : null,
    );
    setPage(1);
    loadDiscussions();
  };

  const handleResolveToggle = async (discussion: Discussion, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await discussionService.resolveDiscussion(discussion.id);
      loadDiscussions();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update status.");
    }
  };

  const handlePinToggle = async (discussion: Discussion, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await discussionService.pinDiscussion(discussion.id);
      loadDiscussions();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to pin discussion.");
    }
  };

  const isInstructor = currentUserRole === "instructor" || currentUserRole === "admin";

  return (
    <div className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScope("lesson")}
            disabled={!lessonId}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              scope === "lesson"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            } ${!lessonId ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            This Lesson Q&A
          </button>
          <button
            onClick={() => setScope("course")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              scope === "course"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            All Course Discussions
          </button>
        </div>

        <button
          onClick={() => setAskModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-500/20 shrink-0"
        >
          + Ask a Question
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex-1 max-w-sm flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-300"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {["all", "open", "answered", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading discussions...</div>
      ) : error ? (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>
      ) : data?.discussions.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No questions found.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Have a question about this lesson? Be the first to ask!
          </p>
          <button
            onClick={() => setAskModalOpen(true)}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 border border-teal-200 dark:border-teal-800"
          >
            Ask a Question
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.discussions.map((d) => (
            <DiscussionCard
              key={d.id}
              discussion={d}
              onClick={() => setSelectedDiscussionId(d.id)}
              onResolve={(e) => handleResolveToggle(d, e)}
              onPin={(e) => handlePinToggle(d, e)}
              currentUserId={currentUserId}
              isInstructor={isInstructor}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AskQuestionModal
        isOpen={askModalOpen}
        onClose={() => setAskModalOpen(false)}
        onSubmit={handleAskQuestion}
        lessonTitle={scope === "lesson" ? lessonTitle : undefined}
      />

      <DiscussionThreadModal
        discussionId={selectedDiscussionId}
        onClose={() => setSelectedDiscussionId(null)}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onStatusChanged={loadDiscussions}
      />
    </div>
  );
};
