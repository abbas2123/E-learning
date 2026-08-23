import { DollarSign, ArrowUpRight, CreditCard, Download } from "lucide-react";
import StatCard from "../../components/StatCard";

export default function RevenueScreen() {
  const payouts = [
    { instructor: "Dr. Sarah Jenkins", courses: 4, gross: 42800, payout: 29960, date: "2026-02-15", status: "Paid" },
    { instructor: "Elena Rostova", courses: 3, gross: 38400, payout: 26880, date: "2026-02-15", status: "Paid" },
    { instructor: "Marcus Vance", courses: 2, gross: 24200, payout: 16940, date: "2026-02-15", status: "Paid" },
    { instructor: "Alex Rivera", courses: 1, gross: 18500, payout: 12950, date: "2026-02-15", status: "Processing" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Revenue & Financial Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Platform gross revenue, instructor payouts, and commissions</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs">
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Gross Platform Revenue" value="₹1,28,450" growth={18.4} icon={DollarSign} iconBgColor="bg-emerald-50" iconTextColor="text-emerald-600" />
        <StatCard title="Instructor Payouts (70%)" value="₹89,915" growth={16.2} icon={CreditCard} iconBgColor="bg-blue-50" iconTextColor="text-blue-600" />
        <StatCard title="Net TOTC Commission (30%)" value="₹38,535" growth={22.8} icon={ArrowUpRight} iconBgColor="bg-purple-50" iconTextColor="text-purple-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Instructor Monthly Payout Roster</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated 70/30 commission distribution</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            Cycle: Feb 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Instructor</th>
                <th className="py-3.5 px-6">Active Courses</th>
                <th className="py-3.5 px-6">Gross Sales</th>
                <th className="py-3.5 px-6">Net Payout (70%)</th>
                <th className="py-3.5 px-6">Payout Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 text-xs sm:text-sm">{p.instructor}</td>
                  <td className="py-4 px-6 font-semibold text-slate-700 text-xs">{p.courses} Courses</td>
                  <td className="py-4 px-6 font-bold text-slate-900">₹{p.gross.toLocaleString()}</td>
                  <td className="py-4 px-6 font-extrabold text-emerald-600">₹{p.payout.toLocaleString()}</td>
                  <td className="py-4 px-6 text-xs text-slate-500">{p.date}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
