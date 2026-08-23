import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instructorService from "../service/instructorService";
import type { InstructorDashboardStats } from "../types/instructor.types";
import { CourseStatusBadge } from "../components/CourseStatusBadge";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { InstructorDiscussionTab } from "../../discussion/components/InstructorDiscussionTab";
import {
  BookOpen,
  Users,
  IndianRupee,
  Star,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function InstructorDashboardScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<InstructorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await instructorService.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load instructor dashboard.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
        <span className="text-xs font-semibold">Loading instructor studio...</span>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      sub: "Gross course revenue",
      icon: IndianRupee,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      label: "Enrolled Students",
      value: stats.totalStudents,
      sub: "Active student learners",
      icon: Users,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    },
    {
      label: "Total Courses",
      value: stats.totalCourses,
      sub: `${stats.publishedCourses} published, ${stats.pendingCourses} pending`,
      icon: BookOpen,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    {
      label: "Instructor Rating",
      value: `${stats.averageRating} ★`,
      sub: "Overall course rating",
      icon: Star,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Instructor Studio Dashboard</h1>
          <p className="mt-1 text-xs text-slate-400">
            Overview of your course portfolio, student enrollment numbers, and course revenue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/instructor/courses/create")}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          Create New Course
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{card.label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-white block">{card.value}</span>
                <span className="text-[11px] text-slate-500 font-medium">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Portfolio & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Courses List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Recent Courses</h3>
            <button
              type="button"
              onClick={() => navigate("/instructor/courses")}
              className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline"
            >
              View All Courses <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {stats.recentCourses.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-xs text-slate-400">
                You have not created any courses yet.
              </div>
            ) : (
              stats.recentCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/instructor/courses/${c.id}/edit`)}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="h-14 w-20 rounded-xl border border-slate-800 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
                        <BookOpen size={24} />
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-sm text-white">{c.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{c.studentCount} students</span>
                        <span>•</span>
                        <span>₹{c.revenue.toLocaleString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star size={12} className="fill-amber-400" /> {c.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CourseStatusBadge status={c.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Recent Enrollments</h3>
          </div>

          <div className="space-y-3">
            {stats.recentEnrollments.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-xs text-slate-500">
                No recent enrollments.
              </div>
            ) : (
              stats.recentEnrollments.map((en, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{en.studentName}</span>
                    <span className="font-bold text-emerald-400">+₹{en.amountPaid}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate">{en.courseTitle}</p>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(en.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructor Q&A Inbox */}
      <div className="pt-6 border-t border-slate-800">
        <InstructorDiscussionTab currentUserId={user?.id || ""} />
      </div>
    </div>
  );
}
