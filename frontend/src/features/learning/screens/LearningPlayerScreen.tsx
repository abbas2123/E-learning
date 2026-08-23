import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCoursesId, getCourseCurriculum } from "../../course/service/courseService";
import type { Course, CourseSection, Lesson, LessonResource } from "../../course/types/course.types";
import progressService, { type CourseProgressSummaryData } from "../../../services/progressService";
import certificateService from "../../../services/certificateService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import {
  PlayCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
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
} from "lucide-react";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Badge } from "../../../components/ui/Badge";
import { QuizPlayer } from "../../quiz/components/QuizPlayer";
import { LessonDiscussionTab } from "../../discussion/components/LessonDiscussionTab";

export default function LearningPlayerScreen() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [progressSummary, setProgressSummary] = useState<CourseProgressSummaryData | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Lesson State
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [markingComplete, setMarkingComplete] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<{ seconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "qa">("overview");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!courseId) return;

    async function initWorkspace() {
      try {
        const [courseData, curriculumSections] = await Promise.all([
          getCoursesId(courseId!),
          getCourseCurriculum(courseId!).catch(() => []),
        ]);

        setCourse(courseData);
        setSections(curriculumSections || []);

        // Try fetching student progress — if successful, user is enrolled!
        let isUserEnrolled = false;
        let progressData: CourseProgressSummaryData | null = null;

        if (isLoggedIn) {
          try {
            progressData = await progressService.getCourseProgress(courseId!);
            isUserEnrolled = true;
          } catch {
            // Non-enrolled or error
            isUserEnrolled = user?.role === "admin" || courseData?.createdBy === user?.id;
          }
        }

        setIsEnrolled(isUserEnrolled);
        setProgressSummary(progressData);

        // Find initial active lesson
        let initialLesson: Lesson | null = null;
        if (curriculumSections && curriculumSections.length > 0) {
          // Find first uncompleted or first available lesson
          const completedSet = new Set(
            progressData?.lessons.filter((l) => l.completed).map((l) => l.lessonId) || [],
          );

          for (const sec of curriculumSections) {
            for (const les of sec.lessons) {
              if (!initialLesson) initialLesson = les;
              if (!completedSet.has(les.id) && (isUserEnrolled || les.isPreview)) {
                initialLesson = les;
                break;
              }
            }
            if (initialLesson && !completedSet.has(initialLesson.id)) break;
          }
        }

        if (initialLesson) {
          setActiveLesson(initialLesson);
        } else {
          // Default fallback lesson if curriculum is empty
          setActiveLesson({
            id: "les-fallback-01",
            sectionId: "sec-01",
            title: "Course Introduction & Setup",
            description: "Welcome to the course. Follow along with the guided lessons.",
            type: "video",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: 10,
            position: 1,
            isPreview: true,
          });
        }
      } catch (err) {
        console.error("Failed to load learning workspace", err);
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
      const updated = await progressService.getCourseProgress(courseId);
      setProgressSummary(updated);
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

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!courseId || !activeLesson || !isLoggedIn || !isEnrolled) return;
    const currentTime = Math.floor(e.currentTarget.currentTime);
    const now = Date.now();

    // Throttled: Send position update every 15 seconds
    if (now - lastUpdateRef.current > 15000 && currentTime > 0) {
      lastUpdateRef.current = now;
      progressService
        .updateLessonProgress(courseId, activeLesson.id, currentTime)
        .catch(() => {});
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
    progressSummary?.lessons.filter((l) => l.completed).map((l) => l.lessonId) || [],
  );

  const isCurrentCompleted = activeLesson ? completedSet.has(activeLesson.id) : false;
  const isLocked = activeLesson ? !isEnrolled && !activeLesson.isPreview : false;

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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/my-learning")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <ChevronLeft size={16} />
            Exit Course
          </button>

          <div className="hidden sm:block">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              TOTC LMS
            </span>
            <h1 className="line-clamp-1 text-sm font-extrabold text-white">
              {course?.title || "Course Player"}
            </h1>
          </div>
        </div>

        {/* Progress & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
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
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT WORKSPACE AREA */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-black">
          {/* Resume Prompt Banner */}
          {resumePrompt && (
            <div className="flex items-center justify-between bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white">
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
                  Enroll in this course to get full access to all lectures, resources, and progress tracking.
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
              <video
                ref={videoRef}
                src={activeLesson.videoUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                className="h-full w-full object-contain"
              />
            ) : activeLesson?.type === "quiz" ? (
              <div className="p-4 md:p-6 overflow-y-auto max-h-full">
                <QuizPlayer
                  courseId={courseId!}
                  lessonId={activeLesson.id}
                  onComplete={refreshProgress}
                />
              </div>
            ) : activeLesson?.type === "assignment" ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <FileCheck size={28} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-white">
                  Practical Assignment
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                  Complete the exercise guidelines and submit your implementation notes.
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <BookOpen size={28} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-white">
                  Reading Module
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                  {activeLesson?.description || "Read through the module guidelines carefully."}
                </p>
              </div>
            )}
          </div>

          {/* LESSON CONTROL & METADATA BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-900 p-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {activeLesson?.title || "Select a lesson"}
                </h2>
                {activeLesson?.isPreview && (
                  <Badge variant="emerald" size="sm">
                    Preview
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Duration: {activeLesson?.duration || 10} minutes • Category: {course?.category}
              </p>
            </div>

            <div className="flex items-center gap-3">
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

          {/* TAB BAR: Overview vs Q&A */}
          <div className="flex items-center gap-4 px-6 pt-4 border-b border-slate-800 bg-slate-900/80">
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
          ) : (
            <>
              {/* COURSE COMPLETION CONGRATULATIONS BANNER */}
              {progressSummary?.completed && (
                <div className="m-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center shadow-xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <Award size={36} />
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold text-white">
                    Congratulations! You completed this course. 🎉
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 max-w-md mx-auto">
                    You have mastered all modules in {course?.title}. Check your profile to view your completion certificate.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!courseId) return;
                      try {
                        toast.loading("Generating your verified certificate...", { id: "cert-gen" });
                        const cert = await certificateService.generateCertificate(courseId);
                        toast.success("Certificate generated successfully! 🎉", { id: "cert-gen" });
                        navigate(`/certificates/verify/${cert.certificateId}`);
                      } catch (err: any) {
                        toast.error(err.message || "Failed to generate certificate.", { id: "cert-gen" });
                        navigate("/certificates");
                      }
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600"
                  >
                    Get Official Certificate
                    <Sparkles size={14} />
                  </button>
                </div>
              )}

              {/* RESOURCES LIST */}
              {activeLesson?.resources && activeLesson.resources.length > 0 && (
                <div className="p-6 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-3">Lesson Resources</h3>
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
                          <Download size={15} className="text-indigo-400 shrink-0" />
                          <span className="truncate font-semibold">{res.title}</span>
                        </div>
                        <ExternalLink size={14} className="text-slate-400 shrink-0 ml-2" />
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
              {progressSummary?.completedLessons ?? 0} of {progressSummary?.totalLessons ?? 0} lessons completed
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
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {!isCollapsed && (
                      <div className="mt-2 space-y-1">
                        {section.lessons.map((lesson) => {
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
                                  <Lock size={14} className="text-slate-500 shrink-0" />
                                ) : lesson.type === "video" ? (
                                  <PlayCircle size={14} className="shrink-0 text-indigo-400" />
                                ) : (
                                  <FileText size={14} className="shrink-0 text-amber-400" />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </div>

                              {isDone ? (
                                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
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
                <h3 className="font-bold text-sm text-white">Course Curriculum</h3>
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
                      {section.lessons.map((lesson) => {
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
                              isSelected ? "bg-indigo-600 text-white" : "text-slate-300"
                            }`}
                          >
                            <span className="truncate">{lesson.title}</span>
                            {isDone && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
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
