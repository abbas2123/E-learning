import { useEffect, useState } from "react";
import instructorService from "../service/instructorService";
import type { InstructorRevenueData } from "../types/instructor.types";
import { toast } from "sonner";
import { IndianRupee, TrendingUp, Calendar, BookOpen, Loader2, Info } from "lucide-react";

export default function InstructorRevenueScreen() {
  const [data, setData] = useState<InstructorRevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const res = await instructorService.getRevenue();
        setData(res);
      } catch (err: any) {
        toast.error(err.message || "Failed to load revenue data.");
      } finally {
        setLoading(false);
      }
    }
    loadRevenue();
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
        <h1 className="text-2xl font-black text-white">Gross Course Revenue</h1>
        <p className="mt-1 text-xs text-slate-400">
          Track transaction volume and sales revenue generated across your published courses.
        </p>
      </div>

      {/* Gross Revenue Notice Alert */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs text-indigo-300">
        <Info size={18} className="shrink-0 text-indigo-400 mt-0.5" />
        <div>
          <strong className="block font-bold">Gross Sales Accounting:</strong>
          <span>
            The metrics below represent Gross Course Revenue from successful student checkout transactions. Net instructor payout processing schedules are subject to platform terms.
          </span>
        </div>
      </div>

      {/* Top Revenue Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400">Lifetime Gross Revenue</span>
          <div className="flex items-center gap-2">
            <IndianRupee size={24} className="text-emerald-400" />
            <span className="text-3xl font-black text-white">₹{data.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400">This Month Revenue</span>
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-indigo-400" />
            <span className="text-3xl font-black text-white">₹{data.thisMonthRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400">Last Month Revenue</span>
          <div className="flex items-center gap-2">
            <Calendar size={24} className="text-blue-400" />
            <span className="text-3xl font-black text-white">₹{data.lastMonthRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Trend & Breakdown per Course */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Bars */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Monthly Revenue Trend (Last 6 Months)
          </h3>

          <div className="space-y-3 pt-2">
            {data.monthlyBreakdown.map((m, idx) => {
              const maxAmount = Math.max(...data.monthlyBreakdown.map((b) => b.amount), 1);
              const barWidth = Math.round((m.amount / maxAmount) * 100);

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">{m.month}</span>
                    <span className="text-emerald-400 font-bold">₹{m.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Breakdown per Course */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Revenue Breakdown by Course
          </h3>

          <div className="space-y-3 pt-2">
            {data.courseBreakdown.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-6">No course sales recorded yet.</div>
            ) : (
              data.courseBreakdown.map((cb) => (
                <div
                  key={cb.courseId}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 font-bold">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{cb.title}</span>
                      <span className="text-[10px] text-slate-400">{cb.enrollmentsCount} enrollments</span>
                    </div>
                  </div>

                  <span className="text-sm font-black text-emerald-400">
                    ₹{cb.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
