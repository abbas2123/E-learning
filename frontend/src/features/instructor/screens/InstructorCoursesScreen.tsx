import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import instructorService from "../service/instructorService";
import type { InstructorCourseSummary } from "../types/instructor.types";
import { CourseStatusBadge } from "../components/CourseStatusBadge";
import { toast } from "sonner";
import {
  Plus,
  BookOpen,
  Edit,
  Eye,
  BarChart3,
  Star,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function InstructorCoursesScreen() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await instructorService.getCourses(activeTab);
      setCourses(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const tabs = [
    { id: "all", label: "All Courses" },
    { id: "draft", label: "Drafts" },
    { id: "pending", label: "Pending Review" },
    { id: "published", label: "Published" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Course Portfolio</h1>
          <p className="mt-1 text-xs text-slate-400">
            Manage your created courses, update curriculum modules, and monitor approval statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/instructor/courses/create")}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          Create Course
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
          <BookOpen size={36} className="mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No courses found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "all"
              ? "You haven't created any courses yet. Click 'Create Course' to author your first module."
              : `No courses in '${activeTab}' state.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden transition hover:border-slate-700 shadow-xl"
            >
              <div>
                {/* Course Thumbnail & Badge Header */}
                <div className="relative h-44 w-full bg-slate-950">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-600">
                      <BookOpen size={40} />
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <CourseStatusBadge status={course.status} />
                  </div>
                </div>

                {/* Course Metadata */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-indigo-400 uppercase tracking-wider">{course.category}</span>
                    <span className="capitalize">{course.level}</span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  {course.status === "rejected" && course.rejectionReason && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-300">
                      <strong className="block font-bold flex items-center gap-1 mb-0.5">
                        <AlertCircle size={12} /> Rejection Reason:
                      </strong>
                      <p className="line-clamp-2">{course.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Users size={14} className="text-indigo-400" /> {course.studentCount}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Star size={14} className="fill-amber-400" /> {course.rating}
                    </span>
                    <span className="font-black text-emerald-400">
                      ₹{course.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
                >
                  <Edit size={14} />
                  Edit Course
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/instructor/courses/${course.id}/edit?tab=preview`)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Preview Course"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/instructor/analytics")}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Analytics"
                  >
                    <BarChart3 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
