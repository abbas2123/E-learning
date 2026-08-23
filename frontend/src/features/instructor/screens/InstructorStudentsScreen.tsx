import { useEffect, useState, useCallback } from "react";
import instructorService from "../service/instructorService";
import type { InstructorPaginatedStudents } from "../types/instructor.types";
import { toast } from "sonner";
import { Users, Search, Loader2, User as UserIcon, CheckCircle2, Clock } from "lucide-react";

export default function InstructorStudentsScreen() {
  const [data, setData] = useState<InstructorPaginatedStudents | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instructorService.getStudents(page, 10, search);
      setData(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load enrolled students.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Enrolled Students Roster</h1>
          <p className="mt-1 text-xs text-slate-400">
            View learners enrolled in your courses, track their completion progress, and monitor engagement.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
      ) : !data || data.students.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
          <Users size={36} className="mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No enrolled students found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? `No student results matching "${search}".` : "Students enrolled in your published courses will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.students.map((st, idx) => (
                  <tr key={idx} className="transition hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {st.avatar ? (
                          <img
                            src={st.avatar}
                            alt={st.studentName}
                            className="h-8 w-8 rounded-full border border-indigo-500/50 object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs">
                            {st.studentName ? st.studentName.charAt(0).toUpperCase() : <UserIcon size={14} />}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-white block">{st.studentName}</span>
                          <span className="text-[11px] text-slate-400">{st.studentEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-medium text-slate-200">{st.courseTitle}</span>
                    </td>

                    <td className="p-4">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-indigo-400">{st.progressPercentage}%</span>
                          <span className="text-slate-400">{st.completedLessonsCount}/{st.totalLessonsCount} lessons</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${st.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {st.completionStatus === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 size={13} /> Course Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                          <Clock size={13} /> Learning in Progress
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {new Date(st.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <span>
                Showing Page {data.page} of {data.totalPages} ({data.total} total students)
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
