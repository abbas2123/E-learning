import { useState } from "react";
import { BookOpen, DollarSign, Layers, Image as ImageIcon, Plus, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { adminService } from "../../services/adminService";

export default function CreateCourseScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "modules" | "media">("general");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Development");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("49.99");
  const [level, setLevel] = useState("Beginner");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80");
  const [modules, setModules] = useState<{ id: string; title: string; lessonsCount: number }[]>([
    { id: "mod-1", title: "Module 1: Getting Started & Prerequisites", lessonsCount: 4 },
  ]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    setModules((prev) => [
      ...prev,
      { id: `mod-${Date.now()}`, title: newModuleTitle.trim(), lessonsCount: 1 },
    ]);
    setNewModuleTitle("");
    toast.success("Module added");
  };

  const handleRemoveModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const handlePublish = async (asDraft = false) => {
    if (!title.trim()) {
      toast.error("Please enter a course title.");
      setActiveTab("general");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createCourse({
        title: title.trim(),
        category,
        description: description.trim() || title.trim(),
        price: Number(price) || 0,
        level: level.toLowerCase(),
        thumbnail: thumbnailUrl,
        status: asDraft ? "draft" : "published",
      });
      toast.success(asDraft ? "Course saved as Draft" : "Course Published successfully!");
      navigate("/admin/courses");
    } catch (err) {
      toast.error("Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/courses")}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Course</h2>
            <p className="text-xs text-slate-500 mt-0.5">Build a course curriculum and publish to catalog</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePublish(true)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handlePublish(false)}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> {isSubmitting ? "Publishing..." : "Publish Course"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "general" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" /> General Details
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "pricing" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Pricing & Level
        </button>
        <button
          onClick={() => setActiveTab("modules")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "modules" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" /> Curriculum & Modules
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "media" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Media & Cover
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        {activeTab === "general" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Full-Stack Web Development"
                className="w-full h-11 px-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Development">Development</option>
                <option value="Design">Design & UX</option>
                <option value="Data Science">Data Science & AI</option>
                <option value="Business">Business & Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                className="w-full p-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-11 px-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {["Beginner", "Intermediate", "Advanced"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLevel(item)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-colors ${
                      level === item
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "modules" && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Module title (e.g. Module 2: State Management)..."
                className="flex-1 h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddModule}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Module
              </button>
            </div>

            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{mod.title}</p>
                    <p className="text-[11px] text-slate-400">{mod.lessonsCount} lessons attached</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(mod.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image Image URL</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full h-11 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Preview Cover Image</p>
              <img
                src={thumbnailUrl}
                alt="Course preview"
                className="w-full h-56 object-cover rounded-2xl border border-slate-200 shadow-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
