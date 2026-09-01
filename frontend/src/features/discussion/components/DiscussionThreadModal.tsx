import React, { useEffect, useState } from "react";
import discussionService from "../../../services/discussionService";
import type {
  Discussion,
  DiscussionReply,
} from "../../../services/discussionService";

interface DiscussionThreadModalProps {
  discussionId: string | null;
  onClose: () => void;
  currentUserId?: string;
  currentUserRole?: string;
  onStatusChanged?: () => void;
}

export const DiscussionThreadModal: React.FC<DiscussionThreadModalProps> = ({
  discussionId,
  onClose,
  currentUserId,
  currentUserRole,
  onStatusChanged,
}) => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportingItem, setReportingItem] = useState<{
    discussionId: string;
    replyId?: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  const loadThread = async () => {
    if (!discussionId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await discussionService.getDiscussion(discussionId);
      setDiscussion(data.discussion);
      setReplies(data.replies);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load thread.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (discussionId) {
      loadThread();
    }
  }, [discussionId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionId || !replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      setError(null);
      const newReply = await discussionService.createReply(
        discussionId,
        replyContent.trim(),
      );
      setReplies((prev) => [...prev, newReply]);
      setReplyContent("");
      // Refresh discussion status
      const updated = await discussionService.getDiscussion(discussionId);
      setDiscussion(updated.discussion);
      if (onStatusChanged) onStatusChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to post reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleResolve = async () => {
    if (!discussionId) return;
    try {
      const updated = await discussionService.resolveDiscussion(discussionId);
      setDiscussion(updated);
      if (onStatusChanged) onStatusChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resolve discussion.");
    }
  };

  const handlePin = async () => {
    if (!discussionId) return;
    try {
      const updated = await discussionService.pinDiscussion(discussionId);
      setDiscussion(updated);
      if (onStatusChanged) onStatusChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to pin discussion.");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!discussionId) return;
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await discussionService.deleteReply(discussionId, replyId);
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete reply.");
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem || !reportReason.trim()) return;

    try {
      setReporting(true);
      if (reportingItem.replyId) {
        await discussionService.reportReply(
          reportingItem.discussionId,
          reportingItem.replyId,
          reportReason.trim(),
        );
      } else {
        await discussionService.reportDiscussion(
          reportingItem.discussionId,
          reportReason.trim(),
        );
      }
      alert("Report submitted to moderators. Thank you!");
      setReportingItem(null);
      setReportReason("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to submit report.");
    } finally {
      setReporting(false);
    }
  };

  if (!discussionId) return null;

  const isInstructor =
    currentUserRole === "instructor" || currentUserRole === "admin";
  const isAuthor = discussion?.studentId === currentUserId;
  const canResolve = isAuthor || isInstructor;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {discussion?.isPinned && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                📌 Pinned
              </span>
            )}
            {discussion?.status === "resolved" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                ✓ Resolved
              </span>
            )}
            {discussion?.status === "answered" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                Instructor Answered
              </span>
            )}
            <h3 className="min-w-0 font-bold text-slate-900 dark:text-slate-100 text-lg">
              Discussion Thread
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Loading thread...
            </div>
          ) : error ? (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          ) : discussion ? (
            <>
              {/* Main Question Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {discussion.author?.avatar ? (
                      <img
                        src={discussion.author.avatar}
                        alt={discussion.author.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                        {discussion.author?.name
                          ? discussion.author.name[0].toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {discussion.author?.name}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(discussion.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isInstructor && (
                      <button
                        onClick={handlePin}
                        className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-medium"
                      >
                        {discussion.isPinned ? "Unpin" : "Pin"}
                      </button>
                    )}
                    {canResolve && discussion.status !== "locked" && (
                      <button
                        onClick={handleResolve}
                        className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${
                          discussion.status === "resolved"
                            ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {discussion.status === "resolved"
                          ? "Reopen"
                          : "✓ Mark Resolved"}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setReportingItem({ discussionId: discussion.id })
                      }
                      className="text-xs text-slate-400 hover:text-red-500 p-1"
                      title="Report content"
                    >
                      🚩
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                  {discussion.title}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                  {discussion.question}
                </p>
              </div>

              {/* Replies Header */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Replies ({replies.length})
                </span>
              </div>

              {/* Replies List */}
              <div className="space-y-3">
                {replies.length === 0 ? (
                  <p className="text-center py-6 text-sm text-slate-400">
                    No replies yet. Be the first to answer!
                  </p>
                ) : (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3.5 rounded-xl border ${
                        reply.isInstructorReply
                          ? "bg-teal-50/70 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800/60"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {reply.author?.avatar ? (
                            <img
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-xs">
                              {reply.author?.name
                                ? reply.author.name[0].toUpperCase()
                                : "U"}
                            </div>
                          )}
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            {reply.author?.name}
                          </span>
                          {reply.isInstructorReply && (
                            <span className="bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Instructor
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {(reply.authorId === currentUserId ||
                            isInstructor) && (
                            <button
                              onClick={() => handleDeleteReply(reply.id)}
                              className="text-xs text-slate-400 hover:text-red-500"
                              title="Delete reply"
                            >
                              🗑️
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setReportingItem({
                                discussionId: discussion.id,
                                replyId: reply.id,
                              })
                            }
                            className="text-xs text-slate-400 hover:text-red-500"
                            title="Report reply"
                          >
                            🚩
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer / Reply Form */}
        {discussion && discussion.status !== "locked" ? (
          <form
            onSubmit={handlePostReply}
            className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2"
          >
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply or answer..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              disabled={submittingReply || !replyContent.trim()}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 shrink-0"
            >
              {submittingReply ? "Posting..." : "Reply"}
            </button>
          </form>
        ) : (
          <div className="p-3 text-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-900">
            🔒 This discussion is locked for new replies.
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 max-w-sm w-full space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Report Content
            </h4>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this content? (Inappropriate, spam, offensive...)"
              className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              rows={3}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reporting || !reportReason.trim()}
                className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
