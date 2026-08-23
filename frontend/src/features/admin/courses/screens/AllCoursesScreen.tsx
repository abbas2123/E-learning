import { useState, useEffect } from "react";
import { Search, PlusCircle, Star, Trash2, Eye } from "lucide-react";
import { adminService, type AdminCourse } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AllCoursesScreen() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCourseModal, setSelectedCourseModal] = useState<AdminCourse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminService.getCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await adminService.deleteCourse(id);
        setCourses((prev) => prev.filter((c) => c.id !== id));
        toast.success("Course deleted successfully");
      } catch (err) {
        toast.error("Failed to delete course");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">All Platform Courses</h2>
          <p className="text-xs text-slate-500 mt-1">Manage catalog, pricing, status, and course details</p>
        </div>
        <button
          onClick={() => navigate("/admin/courses/create")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Create New Course
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or instructor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="data science">Data Science</option>
            <option value="business">Business</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
          </select>

          <span className="text-xs text-slate-400 font-medium ml-auto sm:ml-0">
            Showing {filteredCourses.length} courses
          </span>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading courses catalog...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No courses match your filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Students</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-slate-400">{item.instructor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">₹{item.price}</td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">{item.studentsCount.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          item.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedCourseModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-slate-900 text-lg">{selectedCourseModal.title}</h3>
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <img
              src={selectedCourseModal.thumbnail}
              alt=""
              className="w-full h-40 object-cover rounded-xl border border-slate-200"
            />
            <div className="space-y-2 text-xs text-slate-600">
              <p><strong>Instructor:</strong> {selectedCourseModal.instructor}</p>
              <p><strong>Category:</strong> {selectedCourseModal.category}</p>
              <p><strong>Price:</strong> ${selectedCourseModal.price}</p>
              <p><strong>Level:</strong> {selectedCourseModal.level || "Intermediate"}</p>
              <p><strong>Enrolled Students:</strong> {selectedCourseModal.studentsCount}</p>
              <p><strong>Status:</strong> <span className="capitalize font-semibold">{selectedCourseModal.status}</span></p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
