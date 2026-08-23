import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { adminService, type AdminUser } from "../../services/adminService";

export default function StudentsScreen() {
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminService.getUsers().then((data) => {
      setStudents(data.filter((u) => u.role === "student"));
    });
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Roster</h2>
        <p className="text-xs text-slate-500 mt-1">Directory of registered students & learning progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Enrolled Students</p>
          <p className="text-3xl font-black text-slate-900 mt-2">14,230</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Active Students This Month</p>
          <p className="text-3xl font-black text-blue-600 mt-2">11,480</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Course Completion Rate</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">78.4%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter students..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} Students listed</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">Student Name</th>
              <th className="py-3.5 px-6">Email</th>
              <th className="py-3.5 px-6">Courses Enrolled</th>
              <th className="py-3.5 px-6">Joined Date</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                    {s.name.charAt(0)}
                  </div>
                  {s.name}
                </td>
                <td className="py-4 px-6 text-xs text-slate-500">{s.email}</td>
                <td className="py-4 px-6 font-semibold text-slate-900">{s.enrolledCoursesCount || 4} Courses</td>
                <td className="py-4 px-6 text-xs text-slate-500">{s.joinedAt}</td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {s.status}
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
