import { useState, useEffect } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { adminService, type AdminUser } from "../../services/adminService";

export default function InstructorsScreen() {
  const [instructors, setInstructors] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminService.getUsers().then((data) => {
      setInstructors(data.filter((u) => u.role === "instructor"));
    });
  }, []);

  const filtered = instructors.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Instructors Roster</h2>
        <p className="text-xs text-slate-500 mt-1">Manage verified instructors, active courses, and earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Verified Instructors</p>
          <p className="text-3xl font-black text-slate-900 mt-2">340</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Avg Rating Per Course</p>
          <p className="text-3xl font-black text-amber-600 mt-2">4.86 / 5</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Instructor Payout Share</p>
          <p className="text-3xl font-black text-purple-600 mt-2">70% / 30%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instructor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} Instructors</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((inst) => (
          <div
            key={inst.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {inst.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-base">{inst.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-slate-400">{inst.email}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                  <span>Courses: <strong className="text-slate-900">{inst.createdCoursesCount || 3}</strong></span>
                  <span>Joined: <strong className="text-slate-900">{inst.joinedAt}</strong></span>
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              Verified
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
