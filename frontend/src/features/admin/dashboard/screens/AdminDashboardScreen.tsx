import { useState, useEffect } from "react";
import { adminService, type AdminStats, type EnrollmentRecord, type AdminCourse } from "../../services/adminService";
import OverviewStatsGrid from "../components/OverviewStatsGrid";
import PlatformPerformanceChart from "../components/PlatformPerformanceChart";
import RecentActivityTable from "../components/RecentActivityTable";
import { PlusCircle, Clock, BookOpen, ChevronRight, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [pendingCourses, setPendingCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [s, e, p] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getEnrollments(),
          adminService.getPendingCourses(),
        ]);
        setStats(s);
        setEnrollments(e);
        setPendingCourses(p);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Pending Approvals Alert Banner */}
      {pendingCourses.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {pendingCourses.length} Course Submissions Awaiting Approval
              </h4>
              <p className="text-xs text-amber-700">
                Instructors have submitted new courses for review and publication.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/courses/pending")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1"
          >
            Review Courses <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <OverviewStatsGrid stats={stats} />

      {/* Analytics & Action Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlatformPerformanceChart />
        </div>

        {/* Quick Admin Actions Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Shortcuts for primary admin workflows</p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate("/admin/courses/create")}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Create New Course</p>
                    <p className="text-[11px] text-slate-500">Publish or draft a course</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/admin/users")}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Manage User Access</p>
                    <p className="text-[11px] text-slate-500">View roles & block list</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/admin/categories")}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Edit Categories</p>
                    <p className="text-[11px] text-slate-500">Organize course taxonomy</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">TOTC Platform Status: <span className="text-emerald-600 font-bold">100% Operational</span></span>
          </div>
        </div>
      </div>

      {/* Live Recent Enrollments Feed */}
      <RecentActivityTable enrollments={enrollments} />
    </div>
  );
}
