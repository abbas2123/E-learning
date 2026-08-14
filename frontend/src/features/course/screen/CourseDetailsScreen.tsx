import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Globe2,
  GraduationCap,
  PlayCircle,
  Users,
} from "lucide-react";
import { useState } from "react";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: "video" | "text" | "quiz";
  isPreview?: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

const courseSections: CourseSection[] = [
  {
    id: "section-1",
    title: "Introduction to Full Stack Development",
    lessons: [
      {
        id: "lesson-1",
        title: "Welcome to the course",
        duration: 8,
        type: "video",
        isPreview: true,
      },
      {
        id: "lesson-2",
        title: "How the web works",
        duration: 14,
        type: "video",
      },
      {
        id: "lesson-3",
        title: "Setting up your development environment",
        duration: 18,
        type: "video",
      },
      {
        id: "lesson-4",
        title: "Course roadmap",
        duration: 12,
        type: "text",
      },
    ],
  },
  {
    id: "section-2",
    title: "JavaScript Fundamentals",
    lessons: [
      {
        id: "lesson-5",
        title: "Variables and data types",
        duration: 22,
        type: "video",
      },
      {
        id: "lesson-6",
        title: "Functions",
        duration: 26,
        type: "video",
      },
      {
        id: "lesson-7",
        title: "Arrays and objects",
        duration: 28,
        type: "video",
      },
      {
        id: "lesson-8",
        title: "JavaScript quiz",
        duration: 15,
        type: "quiz",
      },
    ],
  },
  {
    id: "section-3",
    title: "React Development",
    lessons: [
      {
        id: "lesson-9",
        title: "Introduction to React",
        duration: 20,
        type: "video",
      },
      {
        id: "lesson-10",
        title: "Components and props",
        duration: 32,
        type: "video",
      },
      {
        id: "lesson-11",
        title: "State and events",
        duration: 35,
        type: "video",
      },
    ],
  },
  {
    id: "section-4",
    title: "Node.js and Express",
    lessons: [
      {
        id: "lesson-12",
        title: "Introduction to Node.js",
        duration: 24,
        type: "video",
      },
      {
        id: "lesson-13",
        title: "Creating REST APIs",
        duration: 31,
        type: "video",
      },
      {
        id: "lesson-14",
        title: "Express middleware",
        duration: 27,
        type: "video",
      },
    ],
  },
];

const CourseDetailsScreen = () => {
  const [openSections, setOpenSections] = useState<string[]>([
    courseSections[0].id,
  ]);

  const handleEnroll = () => {
    console.log("Enroll clicked");
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Background decoration */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
            {/* Hero information */}
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
                <span>Courses</span>
                <span>/</span>
                <span className="text-slate-300">Web Development</span>
              </div>

              {/* Category */}
              <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                Web Development
              </span>

              {/* Title */}
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Full Stack MERN Development
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Learn how to build modern, production-ready full-stack
                applications using React, Node.js, Express, and MongoDB.
              </p>

              {/* Rating */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">4.8</span>

                  <div className="flex text-amber-400">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span className="text-slate-600">★</span>
                  </div>

                  <span className="text-slate-400">(324 reviews)</span>
                </div>

                <span className="hidden text-slate-600 sm:block">•</span>

                <div className="flex items-center gap-2 text-slate-300">
                  <Users size={17} />
                  2,340 students
                </div>
              </div>

              {/* Stats */}
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <GraduationCap size={17} />
                  Intermediate
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <Clock3 size={17} />
                  42 hours
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <BookOpen size={17} />
                  86 lessons
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
                  <Globe2 size={17} />
                  English
                </div>
              </div>

              <p className="mt-7 text-sm text-slate-500">
                Created and published by{" "}
                <span className="font-semibold text-slate-300">TOTC</span>
              </p>
            </div>

            {/* Enrollment card */}
            <div className="lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
                {/* Course image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                    alt="Full Stack MERN Development"
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    <PlayCircle size={14} />
                    Preview course
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-6">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      ₹2,999
                    </span>

                    <span className="mb-1 text-sm text-slate-400 line-through">
                      ₹4,999
                    </span>

                    <span className="mb-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                      40% OFF
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    One-time payment • Lifetime access
                  </p>

                  <button
                    type="button"
                    onClick={handleEnroll}
                    className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.98]"
                  >
                    Enroll Now
                  </button>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    30-day money-back guarantee
                  </p>

                  {/* Includes */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-sm font-bold text-slate-900">
                      This course includes
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <PlayCircle size={17} className="text-indigo-500" />
                        42 hours of video
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <FileText size={17} className="text-indigo-500" />
                        Downloadable resources
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <BookOpen size={17} className="text-indigo-500" />
                        86 lessons
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <GraduationCap size={17} className="text-indigo-500" />
                        Course certificate
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Users size={17} className="text-indigo-500" />
                        Lifetime access
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="min-w-0">
            {/* What you'll learn */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  Course outcomes
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  What you'll learn
                </h2>
              </div>

              <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  "Build full-stack applications using MERN",
                  "Create modern React applications",
                  "Build REST APIs with Node.js and Express",
                  "Work with MongoDB databases",
                  "Implement authentication and authorization",
                  "Deploy applications to production",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check size={13} strokeWidth={3} />
                    </span>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="mt-10">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  Curriculum
                </p>

                <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      Course content
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      4 sections • 15 lessons • 42 hours of content
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections(
                        openSections.length === courseSections.length
                          ? []
                          : courseSections.map((section) => section.id),
                      )
                    }
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {openSections.length === courseSections.length
                      ? "Collapse all"
                      : "Expand all"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {courseSections.map((section, index) => {
                  const isOpen = openSections.includes(section.id);

                  const totalDuration = section.lessons.reduce(
                    (total, lesson) => total + lesson.duration,
                    0,
                  );

                  return (
                    <div
                      key={section.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      {/* Section header */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900">
                              {section.title}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {section.lessons.length} lessons •{" "}
                              {formatDuration(totalDuration)}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 rounded-full border border-slate-200 p-1.5 text-slate-400">
                          {isOpen ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                        </div>
                      </button>

                      {/* Lessons */}
                      {isOpen && (
                        <div className="border-t border-slate-100">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                  {lesson.type === "video" && (
                                    <PlayCircle size={17} />
                                  )}

                                  {lesson.type === "text" && (
                                    <FileText size={17} />
                                  )}

                                  {lesson.type === "quiz" && (
                                    <BookOpen size={17} />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-700">
                                    {lesson.title}
                                  </p>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs capitalize text-slate-400">
                                      {lesson.type}
                                    </span>

                                    {lesson.isPreview && (
                                      <>
                                        <span className="text-slate-300">
                                          •
                                        </span>

                                        <span className="text-xs font-semibold text-emerald-600">
                                          Preview
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                                <Clock3 size={14} />
                                {lesson.duration} min
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Requirements */}
            <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Before you start
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Requirements
              </h2>

              <ul className="mt-6 space-y-3">
                {[
                  "Basic knowledge of HTML and CSS",
                  "Basic JavaScript knowledge",
                  "A computer with internet access",
                  "Willingness to learn and practice",
                ].map((requirement) => (
                  <li
                    key={requirement}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* =====================================================
              SIDE SUMMARY
          ====================================================== */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Course overview
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Full Stack MERN Development
              </h3>

              <div className="mt-6 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Level</span>
                  <span className="font-semibold text-slate-900">
                    Intermediate
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-900">42 hours</span>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Lessons</span>
                  <span className="font-semibold text-slate-900">86</span>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Students</span>
                  <span className="font-semibold text-slate-900">2,340</span>
                </div>

                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-500">Language</span>
                  <span className="font-semibold text-slate-900">English</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnroll}
                className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Enroll for ₹2,999
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default CourseDetailsScreen;
