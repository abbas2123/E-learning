import React, { useEffect, useState } from "react";
import discussionService from "../../../services/discussionService";
import type {
  Discussion,
  PaginatedDiscussions,
} from "../../../services/discussionService";
import { DiscussionCard } from "./DiscussionCard";
import { DiscussionThreadModal } from "./DiscussionThreadModal";

interface InstructorDiscussionTabProps {
  currentUserId: string;
}

export const InstructorDiscussionTab: React.FC<InstructorDiscussionTabProps> = ({
  currentUserId,
}) => {
  const [data, setData] = useState<PaginatedDiscussions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

  useEffect(() => {
    loadDiscussions();
  }, [page, statusFilter]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await discussionService.getInstructorDiscussions(
        page,
        15,
        statusFilter !== "all" ? statusFilter : undefined,
        undefined,
        searchQuery.trim() || undefined,
      );
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load instructor questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="space-y-4">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
            Student Questions & Q&A Inbox
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage and respond to questions asked across your courses.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student questions..."
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
        {[
          { id: "all", label: "All Questions" },
          { id: "open", label: "Needs Answer" },
          { id: "answered", label: "Instructor Answered" },
          { id: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === tab.id
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading student questions...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
      ) : data?.discussions.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No questions found.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Questions asked by enrolled students will appear here for your response.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.discussions.map((d) => (
            <div key={d.id} className="relative">
              {d.courseTitle && (
                <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 mb-1 px-1">
                  Course: {d.courseTitle}
                </div>
              )}
              <DiscussionCard
                discussion={d}
                onClick={() => setSelectedDiscussionId(d.id)}
                onResolve={(e) => handleResolveToggle(d, e)}
                onPin={(e) => handlePinToggle(d, e)}
                currentUserId={currentUserId}
                isInstructor={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <span>
            Page {data.page} of {data.totalPages} ({data.total} total questions)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Thread Modal */}
      <DiscussionThreadModal
        discussionId={selectedDiscussionId}
        onClose={() => setSelectedDiscussionId(null)}
        currentUserId={currentUserId}
        currentUserRole="instructor"
        onStatusChanged={loadDiscussions}
      />
    </div>
  );
};
