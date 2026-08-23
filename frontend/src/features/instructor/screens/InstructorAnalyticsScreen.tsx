import { useEffect, useState } from "react";
import instructorService from "../service/instructorService";
import type { InstructorAnalyticsData } from "../types/instructor.types";
import { toast } from "sonner";
import { Users, Star, Award, MessageSquare, BookOpen, Loader2 } from "lucide-react";

export default function InstructorAnalyticsScreen() {
  const [data, setData] = useState<InstructorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await instructorService.getAnalytics();
        setData(res);
      } catch (err: any) {
        toast.error(err.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-slate-400">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black text-white">Course Engagement Analytics</h1>
        <p className="mt-1 text-xs text-slate-400">
          Analyze student completion rates, average course ratings, and student feedback across your courses.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400">Total Enrollments</span>
          <div className="flex items-center gap-2">
            <Users size={22} className="text-indigo-400" />
            <span className="text-3xl font-black text-white">{data.totalEnrollments}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400">Avg. Completion Rate</span>
          <div className="flex items-center gap-2">
            <Award size={22} className="text-emerald-400" />
            <span className="text-3xl font-black text-white">{data.averageCompletionRate}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400">Average Rating</span>
          <div className="flex items-center gap-2">
            <Star size={22} className="text-amber-400 fill-amber-400" />
            <span className="text-3xl font-black text-white">{data.averageRating}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400">Total Reviews</span>
          <div className="flex items-center gap-2">
            <MessageSquare size={22} className="text-blue-400" />
            <span className="text-3xl font-black text-white">{data.totalReviews}</span>
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Individual Course Performance Breakdowns
        </h3>

        {data.coursePerformance.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8">No courses available for performance analysis.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Course Title</th>
                  <th className="p-3.5">Enrolled Learners</th>
                  <th className="p-3.5">Avg. Completion Rate</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.coursePerformance.map((c) => (
                  <tr key={c.courseId} className="transition hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-400 shrink-0" />
                      <span>{c.title}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-200">{c.students} students</td>
                    <td className="p-3.5">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-emerald-400">
                          <span>{c.completionRate}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${c.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-amber-400 flex items-center gap-1">
                      <Star size={12} className="fill-amber-400" /> {c.rating}
                    </td>
                    <td className="p-3.5 font-black text-emerald-400">
                      ₹{c.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
