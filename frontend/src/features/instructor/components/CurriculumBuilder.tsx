import { useState, useRef } from "react";
import type { CourseSection, Lesson } from "../../course/types/course.types";
import curriculumService from "../service/curriculumService";
import quizService from "../../quiz/service/quizService";
import type { QuizOption } from "../../quiz/types/quiz.types";
import apiClient from "../../../services/apiClient";
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
  Upload,
  Link as LinkIcon,
  X,
  CheckCircle2,
} from "lucide-react";
import { VideoPlayer } from "../../../components/video/VideoPlayer";

interface CurriculumBuilderProps {
  courseId: string;
  sections: CourseSection[];
  onRefresh: () => void;
}

interface QuestionDraft {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
  points?: number;
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
  const [lessonType, setLessonType] = useState<
    "video" | "text" | "quiz" | "assignment"
  >("video");
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  // ── Video Lesson State ──
  const [videoSourceMode, setVideoSourceMode] = useState<"upload" | "external">(
    "external",
  );
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  // ── Quiz Builder State ──
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizTimeLimitMinutes, setQuizTimeLimitMinutes] = useState(15);
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: "q-1",
      questionText: "",
      options: [
        { id: "opt-1", text: "Option A" },
        { id: "opt-2", text: "Option B" },
        { id: "opt-3", text: "Option C" },
        { id: "opt-4", text: "Option D" },
      ],
      correctOptionId: "opt-1",
      explanation: "",
      points: 1,
    },
  ]);
  const [loadingQuizDetails, setLoadingQuizDetails] = useState(false);
  const [associatedQuizId, setAssociatedQuizId] = useState<string | null>(null);

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
    if (
      !confirm(
        "Are you sure you want to delete this section and all its lessons?",
      )
    )
      return;
    try {
      await curriculumService.deleteSection(sectionId);
      toast.success("Section deleted.");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete section.");
    }
  };

  const handleReorderSection = async (
    index: number,
    direction: "up" | "down",
  ) => {
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

  const openLessonModal = async (sectionId: string, lesson?: Lesson) => {
    setActiveSectionId(sectionId);
    setUploadProgress(null);
    setUploadingFile(false);
    setSelectedFileName(null);

    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description || "");
      setLessonType(lesson.type || "video");
      setLessonVideoUrl(lesson.videoUrl || "");
      setVideoSourceMode(
        lesson.videoSourceType === "uploaded" ||
          (lesson.videoUrl && lesson.videoUrl.includes("cloudinary.com"))
          ? "upload"
          : "external",
      );
      setLessonDuration(lesson.duration || 10);
      setLessonIsPreview(Boolean(lesson.isPreview));

      // If it is a quiz lesson, load existing quiz questions
      if (lesson.type === "quiz") {
        setLoadingQuizDetails(true);
        try {
          // Find quiz by quizId or lessonId
          const courseQuizzes = await quizService.getCourseQuizzes(courseId);
          const foundQuiz = courseQuizzes.find(
            (q) =>
              q.id === lesson.quizId ||
              q.lessonId === lesson.id ||
              q.id === lesson.id,
          );

          if (foundQuiz) {
            setAssociatedQuizId(foundQuiz.id);
            setQuizPassingScore(foundQuiz.passingScore || 70);
            setQuizTimeLimitMinutes(
              foundQuiz.timeLimitSeconds
                ? Math.ceil(foundQuiz.timeLimitSeconds / 60)
                : 15,
            );

            // Fetch questions (instructor gets them)
            const quizRes = await apiClient.get(`/api/quizzes/${foundQuiz.id}`);
            const fetchedQuestions = quizRes.data?.data?.questions || [];

            if (fetchedQuestions.length > 0) {
              setQuestions(
                fetchedQuestions.map((q: any, idx: number) => ({
                  id: q.id || `q-${idx + 1}`,
                  questionText: q.questionText || "",
                  options:
                    q.options && q.options.length >= 2
                      ? q.options
                      : [
                          { id: "opt-1", text: "Option A" },
                          { id: "opt-2", text: "Option B" },
                        ],
                  correctOptionId:
                    Array.isArray(q.correctOptionIds) &&
                    q.correctOptionIds.length > 0
                      ? q.correctOptionIds[0]
                      : q.options?.[0]?.id || "opt-1",
                  explanation: q.explanation || "",
                  points: q.points || 1,
                })),
              );
            }
          } else {
            setAssociatedQuizId(null);
          }
        } catch {
          // Keep default single question template
        } finally {
          setLoadingQuizDetails(false);
        }
      }
    } else {
      setEditingLesson(null);
      setLessonTitle("");
      setLessonDescription("");
      setLessonType("video");
      setLessonVideoUrl("");
      setVideoSourceMode("external");
      setLessonDuration(10);
      setLessonIsPreview(false);
      setAssociatedQuizId(null);
      setQuizPassingScore(70);
      setQuizTimeLimitMinutes(15);
      setQuestions([
        {
          id: `q-${Date.now()}`,
          questionText: "",
          options: [
            { id: "opt-1", text: "Option A" },
            { id: "opt-2", text: "Option B" },
            { id: "opt-3", text: "Option C" },
            { id: "opt-4", text: "Option D" },
          ],
          correctOptionId: "opt-1",
          explanation: "",
          points: 1,
        },
      ]);
    }
    setLessonModalOpen(true);
  };

  // ── Video File Upload Handler ──
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file (.mp4, .webm, .mov, etc.)");
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      toast.error(
        "File size exceeds 150 MB limit. Please select a smaller video.",
      );
      return;
    }

    setSelectedFileName(file.name);
    setUploadingFile(true);
    setUploadProgress(0);

    const controller = new AbortController();
    uploadAbortRef.current = controller;

    try {
      const result = await curriculumService.uploadVideoFile(
        file,
        (percent) => setUploadProgress(percent),
        controller.signal,
      );

      setLessonVideoUrl(result.url);
      if (result.duration && result.duration > 0) {
        setLessonDuration(Math.ceil(result.duration / 60));
      }
      toast.success("Video uploaded successfully! 🎉");
    } catch (err: any) {
      if (err.name === "CanceledError" || err.message === "canceled") {
        toast.info("Video upload cancelled.");
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to upload video.",
        );
      }
      setSelectedFileName(null);
    } finally {
      setUploadingFile(false);
      setUploadProgress(null);
      uploadAbortRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
    }
  };

  // ── Quiz Question Helpers ──
  const handleAddQuestion = () => {
    const newQId = `q-${Date.now()}`;
    setQuestions((prev) => [
      ...prev,
      {
        id: newQId,
        questionText: "",
        options: [
          { id: `opt-${Date.now()}-1`, text: "Option A" },
          { id: `opt-${Date.now()}-2`, text: "Option B" },
          { id: `opt-${Date.now()}-3`, text: "Option C" },
          { id: `opt-${Date.now()}-4`, text: "Option D" },
        ],
        correctOptionId: `opt-${Date.now()}-1`,
        explanation: "",
        points: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      toast.error("A quiz must contain at least 1 question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, questionText: text } : q)),
    );
  };

  const handleAddOptionToQuestion = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const newOptId = `opt-${Date.now()}-${q.options.length + 1}`;
        return {
          ...q,
          options: [
            ...q.options,
            {
              id: newOptId,
              text: `Option ${String.fromCharCode(65 + q.options.length)}`,
            },
          ],
        };
      }),
    );
  };

  const handleRemoveOptionFromQuestion = (qIndex: number, optId: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        if (q.options.length <= 2) {
          toast.error("Each question must have at least 2 options.");
          return q;
        }
        const filtered = q.options.filter((o) => o.id !== optId);
        return {
          ...q,
          options: filtered,
          correctOptionId:
            q.correctOptionId === optId ? filtered[0].id : q.correctOptionId,
        };
      }),
    );
  };

  const handleOptionTextChange = (
    qIndex: number,
    optId: string,
    text: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)),
        };
      }),
    );
  };

  const handleSetCorrectOption = (qIndex: number, optId: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, correctOptionId: optId } : q,
      ),
    );
  };

  const handleQuestionExplanationChange = (
    qIndex: number,
    explanation: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, explanation } : q)),
    );
  };

  // ── Save Lesson & Quiz ──
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      toast.error("Lesson title is required.");
      return;
    }

    if (lessonType === "video" && !lessonVideoUrl.trim()) {
      toast.error("Please provide a valid video URL or upload a video file.");
      return;
    }

    if (lessonType === "quiz") {
      // Validate all quiz questions
      if (questions.length === 0) {
        toast.error("Please add at least 1 question to the quiz.");
        return;
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
          toast.error(`Question ${i + 1} is missing question text.`);
          return;
        }
        if (q.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options.`);
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].text.trim()) {
            toast.error(
              `Option ${j + 1} in Question ${i + 1} cannot be empty.`,
            );
            return;
          }
        }
        if (!q.correctOptionId) {
          toast.error(
            `Please select the correct answer for Question ${i + 1}.`,
          );
          return;
        }
      }
    }

    setSavingLesson(true);
    try {
      let savedLessonId: string | null = null;
      let finalQuizId: string | null = associatedQuizId;

      const payload = {
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        type: lessonType,
        videoUrl: lessonType === "video" ? lessonVideoUrl.trim() : undefined,
        videoSourceType:
          lessonType === "video"
            ? videoSourceMode === "upload"
              ? ("uploaded" as const)
              : ("external" as const)
            : undefined,
        duration: Number(lessonDuration),
        isPreview: lessonIsPreview,
      };

      if (editingLesson) {
        const updated = await curriculumService.updateLesson(
          editingLesson.id,
          payload,
        );
        savedLessonId = updated.id;
        toast.success("Lesson updated.");
      } else if (activeSectionId) {
        const created = await curriculumService.createLesson(
          activeSectionId,
          payload,
        );
        savedLessonId = created.id;
        toast.success("Lesson created.");
      }

      // If it is a quiz, persist the quiz structure and all questions
      if (lessonType === "quiz" && savedLessonId) {
        const quizPayload = {
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          passingScore: Number(quizPassingScore),
          timeLimitSeconds: Number(quizTimeLimitMinutes) * 60,
          lessonId: savedLessonId,
          isPublished: true,
        };

        if (finalQuizId) {
          // Update existing quiz
          await apiClient.put(`/api/quizzes/${finalQuizId}`, quizPayload);
        } else {
          // Create new quiz linked to lesson
          const quizRes = await apiClient.post(
            `/api/courses/${courseId}/quizzes`,
            quizPayload,
          );
          finalQuizId = quizRes.data?.data?.id;
        }

        // Link quizId back to lesson if we have a new quizId
        if (finalQuizId && savedLessonId) {
          await curriculumService.updateLesson(savedLessonId, {
            quizId: finalQuizId,
          });

          // Persist all questions
          // Delete old questions if any and re-create to keep sync
          const existingQRes = await apiClient.get(
            `/api/quizzes/${finalQuizId}`,
          );
          const existingQs = existingQRes.data?.data?.questions || [];
          for (const oldQ of existingQs) {
            await apiClient.delete(`/api/questions/${oldQ.id}`).catch(() => {});
          }

          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await apiClient.post(`/api/quizzes/${finalQuizId}/questions`, {
              questionText: q.questionText.trim(),
              questionType: "single_choice",
              options: q.options.map((o) => ({
                id: o.id,
                text: o.text.trim(),
              })),
              correctOptionIds: [q.correctOptionId],
              explanation: q.explanation?.trim() || null,
              points: 1,
              order: i + 1,
            });
          }

          // Ensure quiz is marked published so students can take it
          await apiClient.put(`/api/quizzes/${finalQuizId}`, {
            isPublished: true,
          });
        }
      }

      setLessonModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to save lesson.",
      );
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
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Video size={15} />
                        </div>
                      ) : les.type === "quiz" ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                          <HelpCircle size={15} />
                        </div>
                      ) : les.type === "assignment" ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                          <FileCheck size={15} />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                          <FileText size={15} />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            {les.title}
                          </span>
                          {les.type === "quiz" && (
                            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                              Quiz{" "}
                              {les.questionCount
                                ? `(${les.questionCount} Qs)`
                                : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="capitalize">
                            {les.type || "video"}
                          </span>
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
                        onClick={() =>
                          handleReorderLesson(sec.id, sec.lessons, lesIdx, "up")
                        }
                        disabled={lesIdx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleReorderLesson(
                            sec.id,
                            sec.lessons,
                            lesIdx,
                            "down",
                          )
                        }
                        disabled={lesIdx === sec.lessons.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openLessonModal(sec.id, les)}
                        className="p-1 text-slate-400 hover:text-indigo-400"
                        title="Edit lesson content"
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
                Add Lesson or Quiz to Section
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
          {addingSection ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add Section
        </button>
      </form>

      {/* Lesson / Quiz Edit / Create Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-4 text-white shadow-2xl space-y-6 sm:p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {lessonType === "quiz"
                    ? editingLesson
                      ? "Edit Knowledge Quiz"
                      : "Create Knowledge Quiz"
                    : editingLesson
                      ? "Edit Lesson"
                      : "Create New Lesson"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lessonType === "quiz"
                    ? "Add assessment questions, options, and passing score."
                    : "Configure lesson content, duration, and video stream."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {loadingQuizDetails ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Loader2
                  size={28}
                  className="animate-spin text-indigo-500 mb-2"
                />
                <span className="text-xs">Loading quiz questions...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveLesson} className="space-y-5 text-xs">
                {/* 1. Title & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {lessonType === "quiz"
                        ? "Quiz Title *"
                        : "Lesson Title *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder={
                        lessonType === "quiz"
                          ? "e.g. Module 1 Knowledge Assessment"
                          : "e.g. Introduction to Component Lifecycle"
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Lesson Type *
                    </label>
                    <select
                      value={lessonType}
                      onChange={(e) => setLessonType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none font-semibold"
                    >
                      <option value="video">📹 Video Lesson</option>
                      <option value="quiz">❓ Knowledge Quiz</option>
                      <option value="assignment">
                        📝 Practical Assignment
                      </option>
                      <option value="text">📖 Text / Reading Lesson</option>
                    </select>
                  </div>
                </div>

                {/* ── VIDEO LESSON OPTIONS (UPLOAD OR EXTERNAL) ── */}
                {lessonType === "video" && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">
                        Video Content Source
                      </span>
                      <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setVideoSourceMode("external")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                            videoSourceMode === "external"
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <LinkIcon size={13} />
                          External Video URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceMode("upload")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                            videoSourceMode === "upload"
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Upload size={13} />
                          Upload Video
                        </button>
                      </div>
                    </div>

                    {/* Option A: Upload Video File */}
                    {videoSourceMode === "upload" ? (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center">
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
                            id="video-file-upload"
                            onChange={handleFileSelect}
                            disabled={uploadingFile}
                            className="hidden"
                          />
                          <label
                            htmlFor="video-file-upload"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
                          >
                            <Upload size={15} />
                            Choose Video File (.mp4, .webm, .mov)
                          </label>
                          <p className="mt-2 text-[11px] text-slate-400">
                            Max file size 150 MB. Fast direct cloud streaming
                            encoding.
                          </p>

                          {selectedFileName && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-indigo-300 border border-slate-700">
                              <Video size={14} />
                              <span className="font-mono font-medium">
                                {selectedFileName}
                              </span>
                            </div>
                          )}

                          {uploadingFile && uploadProgress !== null && (
                            <div className="mt-4 space-y-2 max-w-sm mx-auto">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-300">
                                  Uploading video stream...
                                </span>
                                <span className="text-indigo-400">
                                  {uploadProgress}%
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleCancelUpload}
                                className="text-[11px] font-semibold text-rose-400 hover:underline"
                              >
                                Cancel Upload
                              </button>
                            </div>
                          )}
                        </div>

                        {lessonVideoUrl && (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-300">
                              <CheckCircle2
                                size={16}
                                className="text-emerald-400 shrink-0"
                              />
                              <span className="font-semibold truncate max-w-md">
                                Video Ready: {lessonVideoUrl}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-emerald-400">
                              Uploaded
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Option B: External Video URL (YouTube, Vimeo, MP4, HLS) */
                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-400 font-medium mb-1">
                            External Video Stream URL
                          </label>
                          <input
                            type="url"
                            value={lessonVideoUrl}
                            onChange={(e) => setLessonVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or https://cdn.../video.mp4"
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono text-xs"
                          />
                          <p className="mt-1 text-[11px] text-slate-400">
                            Supports YouTube URLs, Vimeo URLs, direct MP4/WebM
                            CDN links, and HLS (.m3u8) video streams.
                          </p>
                        </div>

                        {/* Live Video Preview Box */}
                        {lessonVideoUrl.trim() && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-black aspect-video max-h-52 w-full">
                            <VideoPlayer url={lessonVideoUrl} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── KNOWLEDGE QUIZ BUILDER ── */}
                {lessonType === "quiz" && (
                  <div className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-4 md:p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-amber-400">
                        <HelpCircle size={18} />
                        <span className="font-bold text-sm text-white">
                          Quiz Question Builder
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                        {questions.length} Question
                        {questions.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-medium mb-1">
                          Passing Score Percentage (%)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={quizPassingScore}
                          onChange={(e) =>
                            setQuizPassingScore(Number(e.target.value))
                          }
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none font-bold"
                        />
                        <span className="text-[10px] text-slate-500">
                          Students must achieve this score to pass and receive
                          course completion credit.
                        </span>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-medium mb-1">
                          Time Limit (Minutes, 0 = unlimited)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={quizTimeLimitMinutes}
                          onChange={(e) =>
                            setQuizTimeLimitMinutes(Number(e.target.value))
                          }
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-5 pt-2">
                      {questions.map((q, qIdx) => (
                        <div
                          key={q.id}
                          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 md:p-5 space-y-4 shadow-lg"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="font-bold text-indigo-400 text-xs uppercase tracking-wider">
                              Question {qIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 size={13} />
                              Remove Question
                            </button>
                          </div>

                          <div>
                            <label className="block text-slate-400 font-medium mb-1">
                              Question Prompt *
                            </label>
                            <input
                              type="text"
                              required
                              value={q.questionText}
                              onChange={(e) =>
                                handleQuestionTextChange(qIdx, e.target.value)
                              }
                              placeholder={`e.g. What is the difference between props and state in React?`}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>

                          {/* Options */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                              <span>
                                Multiple-Choice Options (Select the correct
                                answer)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddOptionToQuestion(qIdx)}
                                className="flex items-center gap-1 text-indigo-400 hover:underline"
                              >
                                <Plus size={12} />
                                Add Option
                              </button>
                            </div>

                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect = q.correctOptionId === opt.id;
                                return (
                                  <div
                                    key={opt.id}
                                    className={`flex items-center gap-2.5 rounded-xl border p-2 transition ${
                                      isCorrect
                                        ? "border-emerald-500/40 bg-emerald-500/10"
                                        : "border-slate-800 bg-slate-950"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`correct-opt-${q.id}`}
                                      checked={isCorrect}
                                      onChange={() =>
                                        handleSetCorrectOption(qIdx, opt.id)
                                      }
                                      title="Set as correct answer"
                                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-[11px] font-bold text-slate-400 w-6">
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>
                                    <input
                                      type="text"
                                      required
                                      value={opt.text}
                                      onChange={(e) =>
                                        handleOptionTextChange(
                                          qIdx,
                                          opt.id,
                                          e.target.value,
                                        )
                                      }
                                      placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                                    />
                                    {q.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveOptionFromQuestion(
                                            qIdx,
                                            opt.id,
                                          )
                                        }
                                        className="p-1 text-slate-500 hover:text-rose-400"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-400 font-medium mb-1">
                              Explanation for Students (Optional — shown after
                              quiz submission)
                            </label>
                            <input
                              type="text"
                              value={q.explanation || ""}
                              onChange={(e) =>
                                handleQuestionExplanationChange(
                                  qIdx,
                                  e.target.value,
                                )
                              }
                              placeholder="e.g. Props are immutable and passed from parent; state is local and mutable."
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition"
                      >
                        <Plus size={15} />
                        Add Question
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Description / Guidelines */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Description / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Provide context or instructions for students..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* 4. Duration & Preview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Estimated Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lessonDuration}
                      onChange={(e) =>
                        setLessonDuration(Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isPreviewToggle"
                      checked={lessonIsPreview}
                      onChange={(e) => setLessonIsPreview(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 cursor-pointer"
                    />
                    <label
                      htmlFor="isPreviewToggle"
                      className="text-slate-300 font-medium cursor-pointer"
                    >
                      Free Preview Lesson
                    </label>
                  </div>
                </div>

                {/* Buttons */}
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
                    disabled={savingLesson || uploadingFile}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {savingLesson && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {lessonType === "quiz"
                      ? "Save Knowledge Quiz"
                      : "Save Lesson"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurriculumBuilder;
