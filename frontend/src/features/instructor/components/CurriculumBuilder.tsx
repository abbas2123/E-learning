import { useState } from "react";
import type { CourseSection, Lesson } from "../../course/types/course.types";
import curriculumService from "../service/curriculumService";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Video,
  FileText,
  HelpCircle,
  FileCheck,
  Loader2,
  Eye,
} from "lucide-react";

interface CurriculumBuilderProps {
  courseId: string;
  sections: CourseSection[];
  onRefresh: () => void;
}

export function CurriculumBuilder({
  courseId,
  sections,
  onRefresh,
}: CurriculumBuilderProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // Lesson modal state
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonType, setLessonType] = useState<"video" | "text" | "quiz" | "assignment">("video");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    setAddingSection(true);
    try {
      await curriculumService.createSection(courseId, newSectionTitle.trim());
      toast.success("Section added successfully.");
      setNewSectionTitle("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create section.");
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section and all its lessons?")) return;
    try {
      await curriculumService.deleteSection(sectionId);
      toast.success("Section deleted.");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete section.");
    }
  };

  const handleReorderSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const orderedIds = newSections.map((s) => s.id);
    try {
      await curriculumService.reorderSections(courseId, orderedIds);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder sections.");
    }
  };

  const openLessonModal = (sectionId: string, lesson?: Lesson) => {
    setActiveSectionId(sectionId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description || "");
      setLessonType(lesson.type || "video");
      setLessonVideoUrl(lesson.videoUrl || "");
      setLessonDuration(lesson.duration || 10);
      setLessonIsPreview(Boolean(lesson.isPreview));
    } else {
      setEditingLesson(null);
      setLessonTitle("");
      setLessonDescription("");
      setLessonType("video");
      setLessonVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
      setLessonDuration(10);
      setLessonIsPreview(false);
    }
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      toast.error("Lesson title is required.");
      return;
    }
    setSavingLesson(true);
    try {
      const payload = {
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        type: lessonType,
        videoUrl: lessonType === "video" ? lessonVideoUrl.trim() : undefined,
        duration: Number(lessonDuration),
        isPreview: lessonIsPreview,
      };

      if (editingLesson) {
        await curriculumService.updateLesson(editingLesson.id, payload);
        toast.success("Lesson updated.");
      } else if (activeSectionId) {
        await curriculumService.createLesson(activeSectionId, payload);
        toast.success("Lesson created.");
      }
      setLessonModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save lesson.");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await curriculumService.deleteLesson(lessonId);
      toast.success("Lesson deleted.");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lesson.");
    }
  };

  const handleReorderLesson = async (
    sectionId: string,
    lessons: Lesson[],
    index: number,
    direction: "up" | "down",
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = [...lessons];
    const [moved] = newLessons.splice(index, 1);
    newLessons.splice(targetIndex, 0, moved);

    const orderedIds = newLessons.map((l) => l.id);
    try {
      await curriculumService.reorderLessons(sectionId, orderedIds);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder lessons.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((sec, secIdx) => (
          <div
            key={sec.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden"
          >
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-850 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  {secIdx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white">{sec.title}</h4>
                  {sec.description && (
                    <p className="text-xs text-slate-400">{sec.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReorderSection(secIdx, "up")}
                  disabled={secIdx === 0}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorderSection(secIdx, "down")}
                  disabled={secIdx === sections.length - 1}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(sec.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Lessons List in Section */}
            <div className="p-4 space-y-2">
              {sec.lessons && sec.lessons.length > 0 ? (
                sec.lessons.map((les, lesIdx) => (
                  <div
                    key={les.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {les.type === "video" ? (
                        <Video size={16} className="text-indigo-400" />
                      ) : les.type === "quiz" ? (
                        <HelpCircle size={16} className="text-amber-400" />
                      ) : les.type === "assignment" ? (
                        <FileCheck size={16} className="text-emerald-400" />
                      ) : (
                        <FileText size={16} className="text-slate-400" />
                      )}

                      <div>
                        <span className="font-semibold text-slate-200">{les.title}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="capitalize">{les.type || "video"}</span>
                          <span>•</span>
                          <span>{les.duration} mins</span>
                          {les.isPreview && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Eye size={10} /> Previewable
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorderLesson(sec.id, sec.lessons, lesIdx, "up")}
                        disabled={lesIdx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorderLesson(sec.id, sec.lessons, lesIdx, "down")}
                        disabled={lesIdx === sec.lessons.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openLessonModal(sec.id, les)}
                        className="p-1 text-slate-400 hover:text-indigo-400"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLesson(les.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No lessons in this section yet.
                </div>
              )}

              <button
                type="button"
                onClick={() => openLessonModal(sec.id)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 p-2.5 text-xs font-bold text-slate-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400 transition"
              >
                <Plus size={14} />
                Add Lesson to Section
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Section Form */}
      <form onSubmit={handleAddSection} className="flex gap-3">
        <input
          type="text"
          placeholder="New Section Title (e.g. Module 1: Core Concepts)..."
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={addingSection || !newSectionTitle.trim()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {addingSection ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Section
        </button>
      </form>

      {/* Lesson Edit / Create Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingLesson ? "Edit Lesson" : "Create New Lesson"}
            </h3>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Introduction to Component Lifecycle"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Lesson Type</label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="video">Video Lesson</option>
                  <option value="text">Text / Reading Lesson</option>
                  <option value="quiz">Knowledge Quiz</option>
                  <option value="assignment">Practical Assignment</option>
                </select>
              </div>

              {lessonType === "video" && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Video Stream URL (.mp4 / HLS / CDN)</label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description / Content Guidelines</label>
                <textarea
                  rows={3}
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="Detailed guidelines or text lesson content..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPreviewToggle"
                    checked={lessonIsPreview}
                    onChange={(e) => setLessonIsPreview(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600"
                  />
                  <label htmlFor="isPreviewToggle" className="text-slate-300 font-medium cursor-pointer">
                    Free Preview Lesson
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingLesson && <Loader2 size={14} className="animate-spin" />}
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
