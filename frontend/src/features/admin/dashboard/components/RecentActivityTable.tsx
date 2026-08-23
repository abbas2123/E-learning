import { Clock } from "lucide-react";
import type { EnrollmentRecord } from "../../services/adminService";

interface RecentActivityTableProps {
  enrollments: EnrollmentRecord[];
}

export default function RecentActivityTable({ enrollments }: RecentActivityTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Platform Enrollments</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live stream of student transactions</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Live Updates
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">Student</th>
              <th className="py-3.5 px-6">Course Enrolled</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Payment Method</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enrollments.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                      {item.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm">{item.studentName}</p>
                      <p className="text-[11px] text-slate-400">{item.studentEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate block max-w-xs">
                    {item.courseTitle}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.enrolledAt}</span>
                </td>
                <td className="py-4 px-6 font-bold text-slate-900">
                  ₹{item.amountPaid.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-xs text-slate-500">{item.paymentMethod}</td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "refunded"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
