import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import instructorService from "../service/instructorService";
import type { InstructorCourseSummary } from "../types/instructor.types";
import { getCourseCurriculum } from "../../course/service/courseService";
import type { CourseSection } from "../../course/types/course.types";
import { CurriculumBuilder } from "../components/CurriculumBuilder";
import { QuizBuilder } from "../components/QuizBuilder";
import { SubmissionChecklist } from "../components/SubmissionChecklist";
import { CoursePreviewModal } from "../components/CoursePreviewModal";
import { CourseStatusBadge } from "../components/CourseStatusBadge";
import quizService from "../../quiz/service/quizService";
import { categoryService } from "../../../services/categoryService";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  BookOpen,
  HelpCircle,
  Eye,
  Send,
  Loader2,
  FileText,
} from "lucide-react";

export default function InstructorCourseEditorScreen() {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isNew = !courseId;
  const initialTab = searchParams.get("tab") || "info";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [course, setCourse] = useState<InstructorCourseSummary | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [quizCount, setQuizCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([]);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Development");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [price, setPrice] = useState(499);
  const [thumbnail, setThumbnail] = useState("");
  const [duration, setDuration] = useState(120);
  const [requirementsText, setRequirementsText] = useState("");
  const [outcomesText, setOutcomesText] = useState("");
  const [minCertificateScore, setMinCertificateScore] = useState(70);

  useEffect(() => {
    categoryService.getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setAvailableCategories(cats);
        }
      })
      .catch(() => {});
  }, []);

  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseData, curriculumSections, quizzes] = await Promise.all([
        instructorService.getCourseById(courseId),
        getCourseCurriculum(courseId).catch(() => []),
        quizService.getCourseQuizzes(courseId).catch(() => []),
      ]);

      setCourse(courseData);
      setSections(curriculumSections || []);
      setQuizCount(quizzes?.length || 0);

      // Populate form
      setTitle(courseData.title);
      setDescription(courseData.description);
      setCategory(courseData.category);
      setLevel(courseData.level);
      setPrice(courseData.price);
      setThumbnail(courseData.thumbnail || "");
      setDuration(courseData.duration || 120);
      setMinCertificateScore(courseData.minCertificateScore ?? 70);
      setRequirementsText(courseData.requirements?.join("\n") || "");
      setOutcomesText(courseData.learningOutcomes?.join("\n") || "");
    } catch (err: any) {
      toast.error(err.message || "Failed to load course details.");
      navigate("/instructor/courses");
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    if (!isNew) {
      loadCourseData();
    }
  }, [isNew, loadCourseData]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Course title is required.");
      return;
    }
    if (!description.trim()) {
      toast.error("Course description is required.");
      return;
    }

    setSaving(true);
    try {
      const parsedMinScore = Math.min(100, Math.max(0, Number(minCertificateScore) || 70));
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        level,
        price: Number(price),
        thumbnail: thumbnail.trim() || null,
        duration: Number(duration),
        minCertificateScore: parsedMinScore,
        requirements: requirementsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        learningOutcomes: outcomesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isNew) {
        const newCourse = await instructorService.createCourse(payload);
        toast.success("Draft course created successfully!");
        navigate(`/instructor/courses/${newCourse.id}/edit`);
      } else if (courseId) {
        const updated = await instructorService.updateCourse(courseId, payload);
        setCourse(updated);
        toast.success("Course information saved.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!courseId) return;
    setSubmitting(true);
    try {
      const res = await instructorService.submitCourseForApproval(courseId);
      toast.success(res.message || "Course submitted for approval!");
      setCourse(res.course);
    } catch (err: any) {
      toast.error(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
        <span className="text-xs font-semibold">Loading course authoring workspace...</span>
      </div>
    );
  }

  const totalLessons = sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/instructor/courses")}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              {isNew ? "Create New Course" : course?.title || "Edit Course"}
            </h1>
            <span className="text-xs text-slate-400">
              {isNew ? "Step 1: Set up course metadata" : "Authoring & Curriculum Studio"}
            </span>
          </div>
        </div>

        {course && (
          <div className="flex items-center gap-3">
            <CourseStatusBadge status={course.status} />
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <Eye size={15} />
              Preview Course
            </button>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      {!isNew && (
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "info", label: "1. Basic Details", icon: FileText },
            { id: "curriculum", label: `2. Curriculum (${sections.length})`, icon: BookOpen },
            { id: "quizzes", label: `3. Quizzes (${quizCount})`, icon: HelpCircle },
            { id: "submit", label: "4. Review & Submit", icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 1: BASIC INFORMATION */}
      {(isNew || activeTab === "info") && (
        <form onSubmit={handleSaveInfo} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Basic Course Information</h3>
            <p className="text-xs text-slate-400">Configure title, description, pricing, and category.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Course Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Fullstack Web Development Bootcamp"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Course Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed summary of what students will learn in this course..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                >
                  {availableCategories.length > 0 ? (
                    availableCategories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Development">Development</option>
                      <option value="Business">Business</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Data Science">Data Science</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Level *</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none font-semibold capitalize"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Price (₹ INR) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Estimated Duration (Mins)</label>
                <input
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Cert. Passing Score (%) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={minCertificateScore}
                  onChange={(e) => setMinCertificateScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-amber-400 focus:border-amber-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Prerequisites (One per line)</label>
                <textarea
                  rows={3}
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder="Basic JavaScript knowledge&#10;Computer with internet access"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Learning Outcomes (One per line)</label>
                <textarea
                  rows={3}
                  value={outcomesText}
                  onChange={(e) => setOutcomesText(e.target.value)}
                  placeholder="Build fullstack React applications&#10;Master Clean Architecture principles"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isNew ? "Create Draft Course" : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CURRICULUM */}
      {!isNew && activeTab === "curriculum" && courseId && (
        <CurriculumBuilder
          courseId={courseId}
          sections={sections}
          onRefresh={loadCourseData}
        />
      )}

      {/* TAB 3: QUIZZES */}
      {!isNew && activeTab === "quizzes" && courseId && (
        <QuizBuilder courseId={courseId} />
      )}

      {/* TAB 4: REVIEW & SUBMIT */}
      {!isNew && activeTab === "submit" && course && (
        <SubmissionChecklist
          course={course}
          sectionCount={sections.length}
          lessonCount={totalLessons}
          quizCount={quizCount}
          onSubmit={handleSubmitForApproval}
          submitting={submitting}
        />
      )}

      {/* Preview Modal */}
      {previewOpen && course && (
        <CoursePreviewModal
          course={course}
          sections={sections}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
