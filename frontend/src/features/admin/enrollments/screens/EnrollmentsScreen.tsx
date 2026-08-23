import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { adminService, type EnrollmentRecord } from "../../services/adminService";

export default function EnrollmentsScreen() {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    adminService.getEnrollments().then(setEnrollments);
  }, []);

  const filtered = enrollments.filter((e) => {
    const matchesSearch =
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Course Enrollments Log</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time audit log of student course purchases & access grants</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or course..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
          <span className="text-xs text-slate-400">{filtered.length} Enrollments logged</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">Transaction ID</th>
              <th className="py-3.5 px-6">Student</th>
              <th className="py-3.5 px-6">Course</th>
              <th className="py-3.5 px-6">Paid</th>
              <th className="py-3.5 px-6">Payment Method</th>
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">{item.id}</td>
                <td className="py-4 px-6 font-semibold text-slate-900 text-xs sm:text-sm">
                  {item.studentName}
                  <span className="block text-[11px] text-slate-400 font-normal">{item.studentEmail}</span>
                </td>
                <td className="py-4 px-6 font-semibold text-slate-800 text-xs max-w-xs truncate">
                  {item.courseTitle}
                </td>
                <td className="py-4 px-6 font-extrabold text-slate-900">₹{item.amountPaid}</td>
                <td className="py-4 px-6 text-xs text-slate-500">{item.paymentMethod}</td>
                <td className="py-4 px-6 text-xs text-slate-500">{item.enrolledAt}</td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      item.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
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
