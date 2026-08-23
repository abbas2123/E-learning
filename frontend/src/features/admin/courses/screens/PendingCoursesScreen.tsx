import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { adminService, type AdminCourse } from "../../services/adminService";
import { toast } from "sonner";

export default function PendingCoursesScreen() {
  const [pendingCourses, setPendingCourses] = useState<AdminCourse[]>([]);
  const [rejectModalCourse, setRejectModalCourse] = useState<AdminCourse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    adminService.getPendingCourses().then(setPendingCourses);
  }, []);

  const handleApprove = async (course: AdminCourse) => {
    await adminService.approveCourse(course.id);
    setPendingCourses((prev) => prev.filter((c) => c.id !== course.id));
    toast.success(`"${course.title}" has been approved & published!`);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalCourse) return;
    await adminService.rejectCourse(rejectModalCourse.id, rejectReason);
    setPendingCourses((prev) => prev.filter((c) => c.id !== rejectModalCourse.id));
    toast.info(`"${rejectModalCourse.title}" was rejected and feedback sent.`);
    setRejectModalCourse(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pending Course Approvals</h2>
        <p className="text-xs text-slate-500 mt-1">Review new courses submitted by instructors before publishing</p>
      </div>

      {pendingCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">All Course Reviews Completed</h3>
          <p className="text-xs text-slate-500 mt-1">No pending instructor submissions at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={course.thumbnail}
                  alt=""
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending Review
                    </span>
                    <span className="text-xs text-slate-400">Submitted: {course.createdAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-600">Instructor: <strong className="text-slate-900">{course.instructor}</strong></p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Category: <strong>{course.category}</strong></span>
                    <span>Price: <strong>₹{course.price}</strong></span>
                    <span>Modules: <strong>{course.modulesCount || 12}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <button
                  onClick={() => setRejectModalCourse(course)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject Submission
                </button>
                <button
                  onClick={() => handleApprove(course)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve & Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <h3 className="font-bold text-slate-900 text-lg">Reject Course Submission</h3>
            <p className="text-xs text-slate-500">Provide feedback for {rejectModalCourse.instructor} regarding why this course requires changes.</p>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please update lesson video resolutions and add quiz modules..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalCourse(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm"
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
