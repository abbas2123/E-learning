import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCoursesId,
  getCourseCurriculum,
} from "../../course/service/courseService";
import quizService from "../../quiz/service/quizService";
import type { Quiz } from "../../quiz/types/quiz.types";
import type {
  Course,
  CourseSection,
  Lesson,
  LessonResource,
} from "../../course/types/course.types";
import progressService, {
  type CourseProgressSummaryData,
} from "../../../services/progressService";
import certificateService, {
  type CertificateStatusData,
} from "../../../services/certificateService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import {
  PlayCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Check,
  Lock,
  BookOpen,
  Download,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  Award,
  FileCheck,
  MessageSquare,
  HelpCircle,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Badge } from "../../../components/ui/Badge";
import { QuizPlayer } from "../../quiz/components/QuizPlayer";
import { LessonDiscussionTab } from "../../discussion/components/LessonDiscussionTab";
import { VideoPlayer } from "../../../components/video/VideoPlayer";

export default function LearningPlayerScreen() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [progressSummary, setProgressSummary] =
    useState<CourseProgressSummaryData | null>(null);
  const [certStatus, setCertStatus] = useState<CertificateStatusData | null>(
    null,
  );
  const [generatingCert, setGeneratingCert] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Lesson State
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const [markingComplete, setMarkingComplete] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<{ seconds: number } | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"overview" | "qa" | "certificate">(
    "overview",
  );

  // Assignment submission state
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!courseId) return;

    async function initWorkspace() {
      try {
        const [courseData, curriculumSections, courseQuizzes] =
          await Promise.all([
            getCoursesId(courseId!),
            getCourseCurriculum(courseId!).catch(() => []),
            quizService.getCourseQuizzes(courseId!).catch(() => []),
          ]);

        setCourse(courseData);

        // Merge standalone quizzes created in Quiz tab into curriculum
        let mergedSections: CourseSection[] = [...(curriculumSections || [])];
        const existingLessonIds = new Set(
          mergedSections.flatMap((s) => (s.lessons || []).map((l) => l.id)),
        );

        const unlinkedQuizzes = (courseQuizzes || []).filter(
          (q: Quiz) =>
            !existingLessonIds.has(q.id) &&
            (!q.lessonId || !existingLessonIds.has(q.lessonId)),
        );

        if (unlinkedQuizzes.length > 0) {
          mergedSections.push({
            id: "sec-assessments",
            courseId: courseId!,
            title: "Course Assessments & Quizzes",
            order: 999,
            position: 999,
            lessons: unlinkedQuizzes.map((q: Quiz, idx: number) => ({
              id: q.id,
              sectionId: "sec-assessments",
              title: q.title,
              description:
                q.description ||
                q.instructions ||
                "Knowledge Assessment & Quiz",
              type: "quiz" as const,
              duration: q.timeLimitSeconds
                ? Math.ceil(q.timeLimitSeconds / 60)
                : 15,
              position: idx + 1,
              isPreview: false,
            })),
          });
        }

        setSections(mergedSections);

        // Try fetching student progress — if successful, user is enrolled!
        let isUserEnrolled = false;
        let progressData: CourseProgressSummaryData | null = null;

        if (isLoggedIn) {
          try {
            progressData = await progressService.getCourseProgress(courseId!);
            isUserEnrolled = true;
          } catch {
            // Non-enrolled or error
            isUserEnrolled =
              user?.role === "admin" || courseData?.createdBy === user?.id;
          }
        }

        setIsEnrolled(isUserEnrolled);
        setProgressSummary(progressData);

        if (isLoggedIn && isUserEnrolled) {
          certificateService
            .getCertificateStatus(courseId!)
            .then(setCertStatus)
            .catch(() => {});
        }

        // Find initial active lesson
        let initialLesson: Lesson | null = null;
        if (mergedSections && mergedSections.length > 0) {
          // Find first uncompleted or first available lesson
          const completedSet = new Set(
            progressData?.lessons
              .filter((l) => l.completed)
              .map((l) => l.lessonId) || [],
          );

          for (const sec of mergedSections) {
            for (const les of sec.lessons || []) {
              if (!initialLesson) initialLesson = les;
              if (
                !completedSet.has(les.id) &&
                (isUserEnrolled || les.isPreview)
              ) {
                initialLesson = les;
                break;
              }
            }
            if (
              initialLesson &&
              !completedSet.has(initialLesson.id) &&
              (isUserEnrolled || initialLesson.isPreview)
            ) {
              break;
            }
          }
        }

        setActiveLesson(
          initialLesson || mergedSections[0]?.lessons?.[0] || null,
        );
      } catch (err: any) {
        toast.error(err.message || "Failed to load course player workspace.");
      } finally {
        setLoading(false);
      }
    }

    initWorkspace();
  }, [courseId, isLoggedIn, user]);

  // Check saved watched position when active lesson changes
  useEffect(() => {
    if (!activeLesson || !courseId || !isLoggedIn || !isEnrolled) {
      setResumePrompt(null);
      return;
    }

    progressService
      .getLessonProgress(courseId, activeLesson.id)
      .then((p) => {
        if (p && p.watchedSeconds > 5 && !p.completed) {
          setResumePrompt({ seconds: p.watchedSeconds });
        } else {
          setResumePrompt(null);
        }
      })
      .catch(() => setResumePrompt(null));
  }, [activeLesson, courseId, isLoggedIn, isEnrolled]);

  // Keyboard shortcut: Escape key closes mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const refreshProgress = async () => {
    if (!courseId || !isLoggedIn) return;
    try {
      const [updatedProgress, updatedCert] = await Promise.all([
        progressService.getCourseProgress(courseId).catch(() => null),
        certificateService.getCertificateStatus(courseId).catch(() => null),
      ]);
      if (updatedProgress) setProgressSummary(updatedProgress);
      if (updatedCert) setCertStatus(updatedCert);
    } catch {
      // Ignore background refresh errors
    }
  };

  const handleMarkComplete = async () => {
    if (!courseId || !activeLesson || !isLoggedIn) {
      if (!isLoggedIn) toast.error("Please log in to track progress.");
      return;
    }
    setMarkingComplete(true);
    try {
      await progressService.markLessonComplete(courseId, activeLesson.id);
      toast.success(`Lesson marked as complete! 🎉`);
      await refreshProgress();
    } catch (err: any) {
      toast.error(err.message || "Failed to mark lesson complete.");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleVideoEnded = () => {
    if (courseId && activeLesson && isLoggedIn && isEnrolled) {
      progressService.markLessonComplete(courseId, activeLesson.id).then(() => {
        toast.success("Lesson finished! 🎉");
        refreshProgress();
      });
    }
  };

  const handleResumeClick = () => {
    if (videoRef.current && resumePrompt) {
      videoRef.current.currentTime = resumePrompt.seconds;
      setResumePrompt(null);
    }
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Flatten all lessons across sections for Next/Prev navigation
  const allFlatLessons: Lesson[] = [];
  sections.forEach((sec) => {
    sec.lessons.forEach((les) => allFlatLessons.push(les));
  });

  const currentIndex = activeLesson
    ? allFlatLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;

  const prevLesson = currentIndex > 0 ? allFlatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allFlatLessons.length - 1
      ? allFlatLessons[currentIndex + 1]
      : null;

  const completedSet = new Set(
    progressSummary?.lessons
      .filter((l) => l.completed)
      .map((l) => l.lessonId) || [],
  );

  const isCurrentCompleted = activeLesson
    ? completedSet.has(activeLesson.id)
    : false;
  const isLocked = activeLesson
    ? !isEnrolled && !activeLesson.isPreview
    : false;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* TOP BAR */}
      <header className="flex h-16 min-w-0 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/my-learning")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <ChevronLeft size={16} />
            Exit Course
          </button>

          <div className="hidden min-w-0 sm:block">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              TOTC LMS
            </span>
            <h1 className="truncate text-sm font-extrabold text-white">
              {course?.title || "Course Player"}
            </h1>
          </div>
        </div>

        {/* Progress & Mobile Menu Toggle */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 w-48">
            <ProgressBar
              progress={progressSummary?.progressPercentage ?? 0}
              size="sm"
            />
            <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
              {progressSummary?.progressPercentage ?? 0}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white md:hidden"
          >
            <Menu size={16} />
            Curriculum
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {/* LEFT WORKSPACE AREA */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-black">
          {/* Resume Prompt Banner */}
          {resumePrompt && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white">
              <span>
                You previously watched up to{" "}
                {Math.floor(resumePrompt.seconds / 60)}:
                {String(resumePrompt.seconds % 60).padStart(2, "0")}.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResumeClick}
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-sm"
                >
                  Resume Position
                </button>
                <button
                  type="button"
                  onClick={() => setResumePrompt(null)}
                  className="p-1 hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* MEDIA PLAYER AREA */}
          <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center">
            {isLocked ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Lock size={28} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-white">
                  Lesson Locked
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                  Enroll in this course to get full access to all lectures,
                  resources, and progress tracking.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/checkout?courseId=${courseId}`)}
                  className="mt-5 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
                >
                  Enroll Now — ₹{course?.price}
                </button>
              </div>
            ) : activeLesson?.type === "video" && activeLesson.videoUrl ? (
              <VideoPlayer
                url={activeLesson.videoUrl}
                sourceType={activeLesson.videoSourceType}
                title={activeLesson.title}
                onTimeUpdate={(currentTime) => {
                  if (!courseId || !activeLesson || !isLoggedIn || !isEnrolled)
                    return;
                  const sec = Math.floor(currentTime);
                  const now = Date.now();
                  if (now - lastUpdateRef.current > 15000 && sec > 0) {
                    lastUpdateRef.current = now;
                    progressService
                      .updateLessonProgress(courseId, activeLesson.id, sec)
                      .catch(() => {});
                  }
                }}
                onEnded={handleVideoEnded}
                className="h-full w-full"
              />
            ) : activeLesson?.type === "quiz" ? (
              <div className="p-4 md:p-6 overflow-y-auto max-h-full w-full">
                <QuizPlayer
                  quizId={activeLesson.quizId || activeLesson.id}
                  courseId={courseId!}
                  lessonId={activeLesson.id}
                  onComplete={refreshProgress}
                />
              </div>
            ) : activeLesson?.type === "assignment" ? (
              <div className="p-6 md:p-10 overflow-y-auto max-h-full w-full max-w-3xl mx-auto">
                <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <FileCheck size={24} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Practical Assignment
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {activeLesson.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Assignment Brief & Instructions
                    </h4>
                    <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {activeLesson.description ||
                        "Review the course principles covered so far and implement the requested tasks. Document your findings or solution below."}
                    </p>
                  </div>

                  {/* Submission Box */}
                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Your Solution / Implementation Notes
                    </label>
                    <textarea
                      rows={5}
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="Paste your GitHub repository link, implementation notes, or solution summary..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[11px] text-slate-400">
                        {assignmentSubmitted
                          ? "✓ Assignment submitted successfully."
                          : "Save your submission notes and mark as completed."}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!assignmentNotes.trim()) {
                            toast.error(
                              "Please enter your assignment solution notes first.",
                            );
                            return;
                          }
                          setSubmittingAssignment(true);
                          try {
                            await handleMarkComplete();
                            setAssignmentSubmitted(true);
                            toast.success(
                              "Assignment submitted and marked complete! 🎉",
                            );
                          } catch (err: any) {
                            toast.error(
                              err.message || "Failed to submit assignment.",
                            );
                          } finally {
                            setSubmittingAssignment(false);
                          }
                        }}
                        disabled={submittingAssignment}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {submittingAssignment ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        {assignmentSubmitted
                          ? "Update Submission"
                          : "Submit Assignment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-10 overflow-y-auto max-h-full w-full max-w-3xl mx-auto">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                        Reading & Reference Module
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {activeLesson?.title || "Module Reader"}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                      {activeLesson?.description ||
                        "Read through the core concepts, architectural diagrams, and recommended best practices for this module."}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      disabled={markingComplete || isCurrentCompleted}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isCurrentCompleted ? (
                        <Check size={15} />
                      ) : (
                        <CheckCircle size={15} />
                      )}
                      {isCurrentCompleted
                        ? "Reading Completed"
                        : "Mark Reading as Done"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LESSON CONTROL & METADATA BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-bold text-white">
                  {activeLesson?.title || "Select an item"}
                </h2>
                {activeLesson?.isPreview && (
                  <Badge variant="emerald" size="sm">
                    Preview
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Type:{" "}
                {activeLesson?.type === "quiz"
                  ? "Assessment Quiz"
                  : activeLesson?.type === "assignment"
                    ? "Practical Exercise"
                    : activeLesson?.type === "text"
                      ? "Reading Guide"
                      : "Video Lecture"}{" "}
                • Duration: {activeLesson?.duration || 10} minutes
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Prev Lesson Button */}
              <button
                type="button"
                onClick={() => prevLesson && setActiveLesson(prevLesson)}
                disabled={!prevLesson}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {/* Complete Lesson Button */}
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={markingComplete || !isLoggedIn}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isCurrentCompleted
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                }`}
              >
                {markingComplete ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : isCurrentCompleted ? (
                  <Check size={15} />
                ) : (
                  <CheckCircle size={15} />
                )}
                {isCurrentCompleted ? "Completed" : "Mark as Complete"}
              </button>

              {/* Next Lesson Button */}
              <button
                type="button"
                onClick={() => nextLesson && setActiveLesson(nextLesson)}
                disabled={!nextLesson}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* TAB BAR: Overview vs Q&A vs Certificate */}
          <div className="flex min-w-0 items-center gap-4 overflow-x-auto px-4 pt-4 border-b border-slate-800 bg-slate-900/80 sm:px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen size={16} />
              Overview & Resources
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 ${
                activeTab === "qa"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare size={16} />
              Q&A & Discussions
            </button>
            <button
              onClick={() => setActiveTab("certificate")}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 ${
                activeTab === "certificate"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award size={16} />
              Certificate
              {certStatus?.eligible || certStatus?.certificate ? (
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Unlocked
                </span>
              ) : (
                <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-750">
                  Locked
                </span>
              )}
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "qa" ? (
            <div className="p-6">
              <LessonDiscussionTab
                courseId={courseId!}
                lessonId={activeLesson?.id}
                lessonTitle={activeLesson?.title}
                currentUserId={user?.id}
                currentUserRole={user?.role}
              />
            </div>
          ) : activeTab === "certificate" ? (
            <div className="p-6 max-w-3xl">
              {certStatus?.eligible || certStatus?.certificate ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-6 md:p-8 text-center shadow-xl space-y-5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <Award size={36} />
                  </div>
                  <div>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      🎓 Certificate Available
                    </span>
                    <h3 className="mt-3 text-2xl font-extrabold text-white">
                      Congratulations! You have completed this course.
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 max-w-md mx-auto">
                      You have met all lesson and assessment requirements with a
                      qualifying course score.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto py-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Your Score
                      </span>
                      <span className="text-xl font-black text-emerald-400">
                        {certStatus.score.current}%
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Required
                      </span>
                      <span className="text-xl font-black text-white">
                        {certStatus.score.required}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {certStatus.certificate ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/certificates/verify/${certStatus.certificate!.certificateId}`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600"
                        >
                          <Award size={15} />
                          View Verified Certificate
                        </button>
                        <a
                          href={certificateService.getDownloadUrl(
                            certStatus.certificate.certificateId,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-900 px-5 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-slate-800"
                        >
                          <Download size={15} />
                          Download PDF
                        </a>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={generatingCert}
                        onClick={async () => {
                          if (!courseId) return;
                          setGeneratingCert(true);
                          try {
                            toast.loading(
                              "Generating your verified certificate...",
                              { id: "cert-gen" },
                            );
                            const cert =
                              await certificateService.generateCertificate(
                                courseId,
                              );
                            toast.success(
                              "Certificate generated successfully! 🎉",
                              { id: "cert-gen" },
                            );
                            await refreshProgress();
                            navigate(
                              `/certificates/verify/${cert.certificateId}`,
                            );
                          } catch (err: any) {
                            toast.error(
                              err.message || "Failed to generate certificate.",
                              { id: "cert-gen" },
                            );
                          } finally {
                            setGeneratingCert(false);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {generatingCert ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        Issue Verified Certificate Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Lock size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                          Course Certification
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          Certificate Locked
                        </h3>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400 border border-slate-700">
                      In Progress
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Complete all course lessons, watch required video lectures,
                    and achieve the minimum passing score on assessments to
                    unlock your certificate.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Lessons</span>
                        {certStatus &&
                        certStatus.progress.completedLessons >=
                          certStatus.progress.totalLessons ? (
                          <CheckCircle2
                            size={15}
                            className="text-emerald-400"
                          />
                        ) : (
                          <XCircle size={15} className="text-slate-500" />
                        )}
                      </div>
                      <span className="text-lg font-bold text-white">
                        {certStatus?.progress.completedLessons ?? 0} /{" "}
                        {certStatus?.progress.totalLessons ?? 0}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Quizzes</span>
                        {certStatus &&
                        (certStatus.progress.totalQuizzes === 0 ||
                          certStatus.progress.completedQuizzes >=
                            certStatus.progress.totalQuizzes) ? (
                          <CheckCircle2
                            size={15}
                            className="text-emerald-400"
                          />
                        ) : (
                          <XCircle size={15} className="text-slate-500" />
                        )}
                      </div>
                      <span className="text-lg font-bold text-white">
                        {certStatus?.progress.completedQuizzes ?? 0} /{" "}
                        {certStatus?.progress.totalQuizzes ?? 0}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Current Score</span>
                        {certStatus?.score.passed ? (
                          <CheckCircle2
                            size={15}
                            className="text-emerald-400"
                          />
                        ) : (
                          <span className="text-[10px] text-amber-400 font-bold">
                            Min {certStatus?.score.required}%
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-lg font-bold ${certStatus?.score.passed ? "text-emerald-400" : "text-amber-400"}`}
                      >
                        {certStatus?.score.current ?? 0}%
                      </span>
                    </div>
                  </div>

                  {certStatus?.reasons && certStatus.reasons.length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                      <strong className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        Remaining Requirements to Unlock:
                      </strong>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {certStatus.reasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-xs font-bold text-slate-500 border border-slate-700 cursor-not-allowed"
                  >
                    <Lock size={14} />
                    Certificate Locked — Complete Requirements Above
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* COURSE COMPLETION BANNER (when eligible in Overview tab) */}
              {(certStatus?.eligible || certStatus?.certificate) && (
                <div className="m-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center shadow-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <Award size={30} />
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold text-white">
                    Congratulations! Course Completed 🎉
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 max-w-md mx-auto">
                    You have mastered all modules and assessments in{" "}
                    {course?.title}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("certificate")}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600"
                  >
                    <Sparkles size={14} />
                    View Course Certificate
                  </button>
                </div>
              )}

              {/* RESOURCES LIST */}
              {activeLesson?.resources && activeLesson.resources.length > 0 && (
                <div className="p-6 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-3">
                    Lesson Resources
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLesson.resources.map((res: LessonResource) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 transition hover:border-indigo-500"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Download
                            size={15}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="truncate font-semibold">
                            {res.title}
                          </span>
                        </div>
                        <ExternalLink
                          size={14}
                          className="text-slate-400 shrink-0 ml-2"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR — CURRICULUM DRAWER (Desktop) */}
        <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-900 overflow-y-auto hidden md:block">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Course Curriculum</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {progressSummary?.completedLessons ?? 0} of{" "}
              {progressSummary?.totalLessons ?? 0} items completed
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {sections.length > 0 ? (
              sections.map((section) => {
                const isCollapsed = Boolean(collapsedSections[section.id]);
                return (
                  <div key={section.id} className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between py-1 text-left text-xs font-bold text-slate-300 hover:text-white"
                    >
                      <span className="uppercase tracking-wider truncate pr-2">
                        {section.title}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>

                    {!isCollapsed && (
                      <div className="mt-2 space-y-1">
                        {(section.lessons || []).map((lesson) => {
                          const isSelected = activeLesson?.id === lesson.id;
                          const isDone = completedSet.has(lesson.id);
                          const isItemLocked = !isEnrolled && !lesson.isPreview;

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => setActiveLesson(lesson)}
                              className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-medium transition ${
                                isSelected
                                  ? "bg-indigo-600 text-white font-bold"
                                  : "text-slate-300 hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isItemLocked ? (
                                  <Lock
                                    size={14}
                                    className="text-slate-500 shrink-0"
                                  />
                                ) : lesson.type === "video" ? (
                                  <PlayCircle
                                    size={14}
                                    className="shrink-0 text-indigo-400"
                                  />
                                ) : lesson.type === "quiz" ? (
                                  <HelpCircle
                                    size={14}
                                    className="shrink-0 text-amber-400"
                                  />
                                ) : lesson.type === "assignment" ? (
                                  <FileCheck
                                    size={14}
                                    className="shrink-0 text-emerald-400"
                                  />
                                ) : (
                                  <BookOpen
                                    size={14}
                                    className="shrink-0 text-sky-400"
                                  />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </div>

                              {isDone ? (
                                <CheckCircle
                                  size={14}
                                  className="text-emerald-400 shrink-0"
                                />
                              ) : (
                                lesson.isPreview && (
                                  <span className="text-[10px] text-emerald-400 font-bold">
                                    Free
                                  </span>
                                )
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No curriculum sections published yet.
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE CURRICULUM DRAWER OVERLAY */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm md:hidden">
            <div className="ml-auto w-4/5 max-w-xs bg-slate-900 p-4 shadow-2xl flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white">
                  Course Curriculum
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 divide-y divide-slate-800">
                {sections.map((section) => (
                  <div key={section.id} className="py-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {(section.lessons || []).map((lesson) => {
                        const isSelected = activeLesson?.id === lesson.id;
                        const isDone = completedSet.has(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              setActiveLesson(lesson);
                              setMobileDrawerOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-medium ${
                              isSelected
                                ? "bg-indigo-600 text-white font-bold"
                                : "text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {lesson.type === "video" ? (
                                <PlayCircle
                                  size={14}
                                  className="shrink-0 text-indigo-400"
                                />
                              ) : lesson.type === "quiz" ? (
                                <HelpCircle
                                  size={14}
                                  className="shrink-0 text-amber-400"
                                />
                              ) : lesson.type === "assignment" ? (
                                <FileCheck
                                  size={14}
                                  className="shrink-0 text-emerald-400"
                                />
                              ) : (
                                <BookOpen
                                  size={14}
                                  className="shrink-0 text-sky-400"
                                />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            {isDone && (
                              <CheckCircle
                                size={14}
                                className="text-emerald-400 shrink-0"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
