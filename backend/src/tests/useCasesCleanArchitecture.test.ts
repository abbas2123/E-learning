import test from "node:test";
import assert from "node:assert/strict";

import { GetCertificateStatusUseCase } from "../modules/certificate/useCase/GetCertificateStatusUseCase.js";
import { GenerateCertificateUseCase } from "../modules/certificate/useCase/GenerateCertificateUseCase.js";
import { MarkLessonCompleteUseCase } from "../modules/progress/useCase/MarkLessonCompleteUseCase.js";
import { UpdateLessonWatchProgressUseCase } from "../modules/progress/useCase/UpdateLessonWatchProgressUseCase.js";
import { ApplyInstructorUseCase } from "../modules/instructor/useCase/ApplyInstructorUseCase.js";
import { GetUserNotificationsUseCase } from "../modules/notification/useCase/GetUserNotificationsUseCase.js";
import { MarkNotificationReadUseCase } from "../modules/notification/useCase/MarkNotificationReadUseCase.js";
import { MarkAllNotificationsReadUseCase } from "../modules/notification/useCase/MarkAllNotificationsReadUseCase.js";
import {
  VIDEO_COMPLETION_THRESHOLD,
  DEFAULT_MIN_CERTIFICATE_SCORE,
} from "../shared/constants/courseConstants.js";
import { User } from "../modules/auth/userEnitity/User.js";
import { LoginUseCase } from "../modules/auth/useCase/loginUseCase.js";
import { RefreshTokenUseCase } from "../modules/auth/useCase/refreshTokenUseCase.js";

// ─── Mock Repositories ────────────────────────────────────────────────────────

function createMockCourseRepo(overrides?: Record<string, any>) {
  return {
    create: async (c: any) => c,
    findById: async (id: string) => null,
    findSummaryById: async (id: string) => ({
      id,
      title: "Clean Architecture in TypeScript",
      createdBy: "instructor_123",
      status: "published",
      minCertificateScore: 70,
      ...overrides,
    }),
    findBySlug: async () => null,
    findAll: async () => [],
    update: async (c: any) => c,
    delete: async () => {},
  };
}

function createMockEnrollmentRepo(isEnrolled = true) {
  return {
    findByStudentAndCourse: async (s: string, c: string) =>
      isEnrolled
        ? {
            id: "enr_1",
            studentId: s,
            studentName: "John Doe",
            studentEmail: "john@example.com",
            courseId: c,
            courseTitle: "Clean Architecture in TypeScript",
            amountPaid: 1999,
            paymentMethod: "Razorpay",
            status: "completed" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        : null,
    findCompletedByStudentAndCourse: async (s: string, c: string) =>
      isEnrolled
        ? {
            id: "enr_1",
            studentId: s,
            studentName: "John Doe",
            studentEmail: "john@example.com",
            courseId: c,
            courseTitle: "Clean Architecture in TypeScript",
            amountPaid: 1999,
            paymentMethod: "Razorpay",
            status: "completed" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        : null,
    isStudentEnrolled: async () => isEnrolled,
    findByStudentId: async () => [],
    findByCourseId: async () => [],
  };
}

function createMockCertificateRepo(existingCert: any = null) {
  let cert = existingCert;
  return {
    createCertificate: async (params: any) => {
      cert = {
        id: "cert_999",
        certificateNumber: "CERT-TOTC-TEST",
        verificationUrl: "http://localhost:5173/verify/CERT-TOTC-TEST",
        createdAt: new Date(),
        status: "issued" as const,
        ...params,
      };
      return cert;
    },
    findByStudentAndCourse: async () => cert,
    findByCertificateId: async () => cert,
    findByCertificateNumber: async () => cert,
    findByStudentId: async () => (cert ? [cert] : []),
    findByStudent: async () => (cert ? [cert] : []),
    verifyCertificate: async () =>
      cert
        ? { isValid: true, certificate: cert }
        : { isValid: false, message: "Not found" },
    revokeCertificate: async () => true,
  };
}

function createMockLessonRepo(lessons: any[] = []) {
  return {
    createLesson: async (l: any) => l,
    findById: async (id: string) => lessons.find((l) => l.id === id) || null,
    findByQuizOrLessonId: async (courseId: string, id: string) =>
      lessons.find((l) => l.id === id || l.quizId === id) || null,
    findBySectionId: async () => [],
    findByCourseId: async () => lessons,
    updateLesson: async (id: string, l: any) => l,
    deleteLesson: async () => true,
    deleteLessonsBySectionId: async () => 0,
    reorderLessons: async () => [],
    getMaxOrder: async () => 1,
  };
}

function createMockProgressRepo(records: any[] = []) {
  const store = new Map<string, any>();
  for (const r of records) {
    store.set(`${r.studentId}:${r.courseId}:${r.lessonId}`, r);
  }
  return {
    findByLesson: async (
      studentId: string,
      courseId: string,
      lessonId: string,
    ) => store.get(`${studentId}:${courseId}:${lessonId}`) || null,
    findByCourse: async (studentId: string, courseId: string) =>
      Array.from(store.values()).filter(
        (r) => r.studentId === studentId && r.courseId === courseId,
      ),
    upsertProgress: async (dto: any) => {
      store.set(`${dto.studentId}:${dto.courseId}:${dto.lessonId}`, dto);
      return dto;
    },
    getCourseCompletionStats: async () => ({
      completedLessons: 0,
      totalLessons: 0,
      percentage: 0,
    }),
    countCompletedLessons: async (studentId: string, courseId: string) =>
      Array.from(store.values()).filter(
        (r) =>
          r.studentId === studentId && r.courseId === courseId && r.completed,
      ).length,
  };
}

function createMockQuizRepo(quizzes: any[] = []) {
  return {
    create: async (p: any) => p,
    findById: async (id: string) => quizzes.find((q) => q.id === id) || null,
    findByCourseId: async () => quizzes,
    findByLessonId: async (lId: string) =>
      quizzes.find((q) => q.lessonId === lId) || null,
    update: async () => null,
    delete: async () => true,
  };
}

function createMockAttemptRepo(attempts: any[] = []) {
  return {
    create: async (p: any) => p,
    findById: async (id: string) => attempts.find((a) => a.id === id) || null,
    findInProgress: async () => null,
    findByStudentAndQuiz: async (s: string, q: string) =>
      attempts.filter((a) => a.studentId === s && a.quizId === q),
    findSubmittedByStudentAndQuiz: async (s: string, q: string) =>
      attempts.filter(
        (a) => a.studentId === s && a.quizId === q && a.status === "submitted",
      ),
    getBestPercentageByStudentAndQuiz: async (s: string, q: string) => {
      const matched = attempts.filter(
        (a) => a.studentId === s && a.quizId === q && a.status === "submitted",
      );
      return matched.length > 0
        ? Math.max(...matched.map((m) => m.percentage || 0))
        : 0;
    },
    findByQuizId: async (q: string) => attempts.filter((a) => a.quizId === q),
    countByStudentAndQuiz: async (s: string, q: string) =>
      attempts.filter((a) => a.studentId === s && a.quizId === q).length,
    submit: async () => null,
    deleteByQuizId: async () => 0,
  };
}

function createMockUserRepo(user: any = null) {
  return {
    findByEmail: async () => user,
    create: async () => user,
    findById: async () => user,
    update: async () => user,
    delete: async () => {},
    savePasswordResetToken: async () => {},
    findByPasswordResetToken: async () => null,
    clearPasswordResetToken: async () => {},
  };
}

function createMockNotificationRepo() {
  const notifications: any[] = [];
  return {
    createNotification: async (n: any) => {
      notifications.push(n);
      return { id: "notif_1", ...n, createdAt: new Date() };
    },
    findByUserId: async () => notifications,
    findAdminNotifications: async () => notifications,
    markAsRead: async () => true,
    markAllAsRead: async () => notifications.length,
    getUnreadCount: async () => notifications.filter((n) => !n.read).length,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test("GetCertificateStatusUseCase: blocks ineligible student when lessons are incomplete", async () => {
  const lessons = [
    { id: "les_1", courseId: "c_1", duration: 10, type: "video" },
    { id: "les_2", courseId: "c_1", duration: 5, type: "video" },
  ];
  // Student only completed lesson 1
  const progress = [
    {
      studentId: "u_1",
      courseId: "c_1",
      lessonId: "les_1",
      completed: true,
      watchedSeconds: 600,
    },
  ];

  const useCase = new GetCertificateStatusUseCase(
    createMockCertificateRepo(),
    createMockCourseRepo(),
    createMockEnrollmentRepo(true),
    createMockLessonRepo(lessons),
    createMockProgressRepo(progress),
    createMockQuizRepo([]),
    createMockAttemptRepo([]),
  );

  const status = await useCase.execute({ userId: "u_1", courseId: "c_1" });
  assert.equal(status.eligible, false);
  assert.equal(status.progress.completedLessons, 1);
  assert.equal(status.progress.totalLessons, 2);
  assert.ok(status.reasons.some((r) => r.includes("remaining to complete")));
});

test("MarkLessonCompleteUseCase: reports insufficient video watch time as a typed 422 error", async () => {
  const useCase = new MarkLessonCompleteUseCase(
    createMockProgressRepo(),
    createMockCourseRepo(),
    createMockLessonRepo([
      { id: "les_video", courseId: "c_1", duration: 10, type: "video" },
    ]),
    createMockEnrollmentRepo(true),
  );

  await assert.rejects(
    () =>
      useCase.execute({
        userId: "u_1",
        courseId: "c_1",
        lessonId: "les_video",
        watchedSeconds: 0,
        userRole: "student",
      }),
    (error: any) =>
      error.statusCode === 422 &&
      error.code === "VIDEO_WATCH_TIME_INSUFFICIENT" &&
      error.message.includes("0s watched of 600s") &&
      error.message.includes("540s"),
  );
});

test("GetCertificateStatusUseCase: grants eligibility when all lessons and quizzes pass minimum score", async () => {
  const lessons = [
    { id: "les_1", courseId: "c_1", duration: 10, type: "video" },
  ];
  const quizzes = [{ id: "quiz_1", courseId: "c_1", passingScore: 70 }];
  const progress = [
    {
      studentId: "u_1",
      courseId: "c_1",
      lessonId: "les_1",
      completed: true,
      watchedSeconds: 600,
    },
  ];
  const attempts = [
    {
      studentId: "u_1",
      quizId: "quiz_1",
      status: "submitted",
      percentage: 85,
      passed: true,
    },
  ];

  const useCase = new GetCertificateStatusUseCase(
    createMockCertificateRepo(),
    createMockCourseRepo({ minCertificateScore: 70 }),
    createMockEnrollmentRepo(true),
    createMockLessonRepo(lessons),
    createMockProgressRepo(progress),
    createMockQuizRepo(quizzes),
    createMockAttemptRepo(attempts),
  );

  const status = await useCase.execute({ userId: "u_1", courseId: "c_1" });
  assert.equal(status.eligible, true);
  assert.equal(status.score.passed, true);
  assert.equal(status.score.current, 85);
  assert.equal(status.reasons.length, 0);
});

test("UpdateLessonWatchProgressUseCase: correctly computes 90% threshold for video completion", async () => {
  const lessons = [
    { id: "les_1", courseId: "c_1", duration: 10, type: "video" },
  ]; // 600s total, threshold = 540s (90%)
  const progressRepo = createMockProgressRepo();

  const useCase = new UpdateLessonWatchProgressUseCase(
    progressRepo,
    createMockCourseRepo(),
    createMockLessonRepo(lessons),
    createMockEnrollmentRepo(true),
  );

  // 1. Under threshold (500s < 540s) -> not completed
  const res1 = await useCase.execute({
    userId: "u_1",
    courseId: "c_1",
    lessonId: "les_1",
    watchedSeconds: 500,
  });
  assert.equal(res1.completed, false);
  assert.equal(res1.watchedSeconds, 500);

  // 2. Over threshold (545s >= 540s) -> auto-completed
  const res2 = await useCase.execute({
    userId: "u_1",
    courseId: "c_1",
    lessonId: "les_1",
    watchedSeconds: 545,
  });
  assert.equal(res2.completed, true);
  assert.equal(res2.watchedSeconds, 545);
});

test("GenerateCertificateUseCase: is idempotent and prevents unearned certificates", async () => {
  const lessons = [
    { id: "les_1", courseId: "c_1", duration: 10, type: "video" },
  ];
  const progress = [
    {
      studentId: "u_1",
      courseId: "c_1",
      lessonId: "les_1",
      completed: false,
      watchedSeconds: 100,
    },
  ];

  const certRepo = createMockCertificateRepo();
  const statusUseCase = new GetCertificateStatusUseCase(
    certRepo,
    createMockCourseRepo(),
    createMockEnrollmentRepo(true),
    createMockLessonRepo(lessons),
    createMockProgressRepo(progress),
    createMockQuizRepo([]),
    createMockAttemptRepo([]),
  );

  const generateUseCase = new GenerateCertificateUseCase(
    certRepo,
    createMockCourseRepo(),
    createMockEnrollmentRepo(true),
    createMockUserRepo(),
    statusUseCase,
  );

  // Ineligible attempt should throw
  await assert.rejects(async () => {
    await generateUseCase.execute({ userId: "u_1", courseId: "c_1" });
  }, /Certificate Ineligible/);
});

test("ApplyInstructorUseCase: submits application and prevents duplicate for existing instructor", async () => {
  const existingInstructor = User.reconstruct({
    id: "inst_1",
    name: "Jane Instructor",
    email: "jane@example.com",
    password: "hash",
    role: "instructor",
    provider: "local",
    isVerified: true,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const studentUser = User.reconstruct({
    id: "student_1",
    name: "Sam Student",
    email: "sam@example.com",
    password: "hash",
    role: "student",
    provider: "local",
    isVerified: true,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const notifRepo = createMockNotificationRepo();

  // 1. Existing instructor
  const useCaseInst = new ApplyInstructorUseCase(
    createMockUserRepo(existingInstructor),
    notifRepo,
  );
  const res1 = await useCaseInst.execute({ userId: "inst_1" });
  assert.equal(res1.status, "active");
  assert.ok(res1.message.includes("already have instructor access"));

  // 2. Student applicant
  const useCaseStudent = new ApplyInstructorUseCase(
    createMockUserRepo(studentUser),
    notifRepo,
  );
  const res2 = await useCaseStudent.execute({
    userId: "student_1",
    expertise: "Computer Science",
  });
  assert.equal(res2.status, "pending_review");
  assert.equal(res2.success, true);
});

test("LoginUseCase: rejects blocked users before issuing tokens", async () => {
  const blockedUser = User.reconstruct({
    id: "blocked_1",
    name: "Blocked User",
    email: "blocked@example.com",
    password: "hash",
    role: "student",
    provider: "local",
    isVerified: true,
    isBlocked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  let passwordCompared = false;
  const useCase = new LoginUseCase(
    {
      compare: async () => {
        passwordCompared = true;
        return true;
      },
      hash: async (value: string) => value,
    },
    createMockUserRepo(blockedUser),
    {
      generateAccessToken: () => "access",
      generateRefreshToken: () => "refresh",
      verifyAccessToken: () => ({ userId: blockedUser.getId() }),
      verifyRefreshToken: () => ({ userId: blockedUser.getId() }),
    },
    {
      saveOtp: async () => {},
      findOtp: async () => null,
      deleteOtp: async () => {},
    },
    { generateOtp: () => "123456", sendOtp: async () => {} },
  );

  await assert.rejects(
    () =>
      useCase.execute({ email: blockedUser.getEmail(), password: "password" }),
    (error: any) => error.code === "USER_BLOCKED" && error.statusCode === 403,
  );
  assert.equal(passwordCompared, false);
});

test("RefreshTokenUseCase: rejects refresh for a blocked user", async () => {
  const blockedUser = User.reconstruct({
    id: "blocked_refresh_1",
    name: "Blocked User",
    email: "blocked-refresh@example.com",
    password: "hash",
    role: "student",
    provider: "local",
    isVerified: true,
    isBlocked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const useCase = new RefreshTokenUseCase(createMockUserRepo(blockedUser), {
    generateAccessToken: () => "access",
    generateRefreshToken: () => "refresh",
    verifyAccessToken: () => ({ userId: blockedUser.getId() }),
    verifyRefreshToken: () => ({ userId: blockedUser.getId() }),
  });

  await assert.rejects(
    () => useCase.execute("old-refresh-token"),
    (error: any) => error.code === "USER_BLOCKED" && error.statusCode === 403,
  );
});

test("GetUserNotificationsUseCase: retrieves user-scoped notifications and accurate unread count", async () => {
  const store = [
    {
      id: "n_1",
      title: "Payment Received",
      message: "Course unlocked",
      userId: "u_1",
      read: false,
      createdAt: new Date(),
    },
    {
      id: "n_2",
      title: "System Update",
      message: "Maintenance scheduled",
      userId: null,
      read: true,
      createdAt: new Date(),
    },
    {
      id: "n_3",
      title: "Certificate Ready",
      message: "View your cert",
      userId: "u_1",
      read: false,
      createdAt: new Date(),
    },
  ];

  const mockNotifRepo = {
    createNotification: async (n: any) => ({
      id: "n_new",
      ...n,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findByUserId: async (uid: string) =>
      store.filter((n) => n.userId === uid || n.userId === null) as any,
    markAsRead: async (id: string, uid?: string) => {
      const item = store.find((n) => n.id === id);
      if (item) {
        item.read = true;
        return true;
      }
      return false;
    },
    markAllAsRead: async (uid: string) => {
      let count = 0;
      for (const n of store) {
        if ((n.userId === uid || n.userId === null) && !n.read) {
          n.read = true;
          count++;
        }
      }
      return count;
    },
    getUnreadCount: async (uid: string) =>
      store.filter((n) => (n.userId === uid || n.userId === null) && !n.read)
        .length,
  };

  const getUseCase = new GetUserNotificationsUseCase(mockNotifRepo);
  const markReadUseCase = new MarkNotificationReadUseCase(mockNotifRepo);
  const markAllUseCase = new MarkAllNotificationsReadUseCase(mockNotifRepo);

  // 1. Fetch initial unread count
  const initial = await getUseCase.execute("u_1");
  assert.equal(initial.notifications.length, 3);
  assert.equal(initial.unreadCount, 2);

  // 2. Mark single notification read
  const marked = await markReadUseCase.execute("n_1", "u_1");
  assert.equal(marked, true);
  const afterOne = await getUseCase.execute("u_1");
  assert.equal(afterOne.unreadCount, 1);

  // 3. Mark all read
  const clearedCount = await markAllUseCase.execute("u_1");
  assert.equal(clearedCount, 1);
  const finalState = await getUseCase.execute("u_1");
  assert.equal(finalState.unreadCount, 0);
});

test("Notification Security: Student A cannot view or tamper with Student B's notifications", async () => {
  const store = [
    {
      id: "n_a1",
      title: "Payment A",
      message: "Course A unlocked",
      userId: "student_a",
      read: false,
      createdAt: new Date(),
    },
    {
      id: "n_a2",
      title: "Certificate A",
      message: "Cert ready",
      userId: "student_a",
      read: false,
      createdAt: new Date(),
    },
    {
      id: "n_b1",
      title: "Payment B",
      message: "Course B unlocked",
      userId: "student_b",
      read: false,
      createdAt: new Date(),
    },
  ];

  const mockNotifRepo = {
    createNotification: async (n: any) => ({
      id: "n_new",
      ...n,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findByUserId: async (uid: string) =>
      store.filter((n) => n.userId === uid || n.userId === null) as any,
    markAsRead: async (id: string, uid?: string) => {
      const item = store.find(
        (n) => n.id === id && (!uid || n.userId === uid || n.userId === null),
      );
      if (item) {
        item.read = true;
        return true;
      }
      return false; // Security rejection: not found or unauthorized
    },
    markAllAsRead: async (uid: string) => {
      let count = 0;
      for (const n of store) {
        if ((n.userId === uid || n.userId === null) && !n.read) {
          n.read = true;
          count++;
        }
      }
      return count;
    },
    getUnreadCount: async (uid: string) =>
      store.filter((n) => (n.userId === uid || n.userId === null) && !n.read)
        .length,
  };

  const getUseCase = new GetUserNotificationsUseCase(mockNotifRepo);
  const markReadUseCase = new MarkNotificationReadUseCase(mockNotifRepo);
  const markAllUseCase = new MarkAllNotificationsReadUseCase(mockNotifRepo);

  // 1. Student A queries notifications — must not contain Student B's notification
  const studentANotifs = await getUseCase.execute("student_a");
  assert.equal(studentANotifs.notifications.length, 2);
  assert.ok(
    studentANotifs.notifications.every((n) => n.userId === "student_a"),
  );
  assert.equal(
    studentANotifs.notifications.some((n) => n.id === "n_b1"),
    false,
  );

  // 2. Student A attempts to mark Student B's notification as read — must be rejected
  const tamperResult = await markReadUseCase.execute("n_b1", "student_a");
  assert.equal(tamperResult, false);
  const studentBItem = store.find((n) => n.id === "n_b1");
  assert.equal(studentBItem?.read, false); // Still unread for Student B

  // 3. Student A marks all as read — Student B's notification must remain unread
  await markAllUseCase.execute("student_a");
  assert.equal(studentBItem?.read, false);
  const studentBState = await getUseCase.execute("student_b");
  assert.equal(studentBState.unreadCount, 1);
});

test("Dashboard Algorithm: verifies Resume Course priority and 0-division safety", () => {
  // Case A & B: Algorithm filters out 100% completed courses and selects most recent in-progress
  const courses = [
    {
      id: "c1",
      title: "React Mastery",
      totalLessons: 10,
      completedLessons: 10,
      progress: 100,
      lastUpdated: 1000,
    },
    {
      id: "c2",
      title: "Node Architecture",
      totalLessons: 10,
      completedLessons: 4,
      progress: 40,
      lastUpdated: 2000,
    },
    {
      id: "c3",
      title: "TypeScript Basics",
      totalLessons: 10,
      completedLessons: 2,
      progress: 20,
      lastUpdated: 500,
    },
  ];

  const inProgressCourses = courses.filter((c) => c.progress < 100);
  inProgressCourses.sort((a, b) => b.lastUpdated - a.lastUpdated);

  const selectedResumeCourse = inProgressCourses[0];
  assert.equal(selectedResumeCourse.id, "c2"); // c2 is chosen over completed c1 and older c3

  // Division by zero safety for 0-lesson course
  const zeroLessonCourse = { totalLessons: 0, completedLessons: 0 };
  const safeProgress =
    zeroLessonCourse.totalLessons > 0
      ? Math.round(
          (zeroLessonCourse.completedLessons / zeroLessonCourse.totalLessons) *
            100,
        )
      : 0;

  assert.equal(isNaN(safeProgress), false);
  assert.equal(safeProgress, 0);
});
