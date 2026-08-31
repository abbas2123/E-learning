import { randomUUID } from "crypto";
import type {
  IDashboardRepository,
  DashboardSummary,
  ActiveCourse,
  CatalogCourse,
  ResumeCourseInfo,
} from "../../interface/IDashboardRepository";
import { UserModel } from "../../../auth/Repository/database/User";
import { CourseModel } from "../../../course/repository/database/Course";
import { EnrollmentModel } from "../../../admin/Repository/database/Enrollment";
import { LessonModel } from "../../../curriculum/database/Lesson";
import { LessonProgressModel } from "../../../progress/database/LessonProgress";
import { CertificateModel } from "../../../certificate/database/Certificate";

export class DashboardRepository implements IDashboardRepository {
  async getSummaryByUserId(userId: string): Promise<DashboardSummary> {
    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });

    const studentId = user?.id || userId;
    const studentEmail = user?.email || userId;

    const enrollments = await EnrollmentModel.find({
      $or: [{ studentId }, { studentEmail }],
      status: "completed",
    });

    const enrolledCount = enrollments.length;

    let activeCount = 0;
    let completedCount = 0;
    let mostRecentResumeCourse: ResumeCourseInfo | null = null;
    let mostRecentUpdateTime = 0;

    for (const e of enrollments) {
      const course = await CourseModel.findOne({ id: e.courseId });
      const lessons = await LessonModel.find({ courseId: e.courseId }).sort({ order: 1 });
      const totalLessons = lessons.length;

      const progressRecords = await LessonProgressModel.find({
        studentId,
        courseId: e.courseId,
      });

      const completedMap = new Map(
        progressRecords.map((p) => [p.lessonId, p.completed]),
      );

      const completedLessons = lessons.filter((l) => completedMap.get(l.id)).length;
      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      if (totalLessons > 0 && completedLessons >= totalLessons) {
        completedCount++;
      } else {
        activeCount++;
      }

      // Find first incomplete lesson to resume
      const nextIncompleteLesson = lessons.find((l) => !completedMap.get(l.id)) || lessons[0];

      // Track the latest updated progress time for finding the most recently active course
      const latestProgressTime = progressRecords.reduce(
        (max, p) => Math.max(max, new Date(p.updatedAt || p.createdAt).getTime()),
        new Date(e.createdAt).getTime(),
      );

      if (
        (!mostRecentResumeCourse || latestProgressTime > mostRecentUpdateTime) &&
        progressPercentage < 100
      ) {
        mostRecentUpdateTime = latestProgressTime;
        mostRecentResumeCourse = {
          courseId: e.courseId,
          courseTitle: e.courseTitle || course?.title || "Enrolled Course",
          lessonId: nextIncompleteLesson?.id,
          lessonTitle: nextIncompleteLesson?.title,
          progressPercentage,
          thumbnail: course?.thumbnail || undefined,
        };
      }
    }

    // If all courses are completed, resume course can be the last completed one or null
    if (!mostRecentResumeCourse && enrollments.length > 0) {
      const firstCourse = await CourseModel.findOne({ id: enrollments[0].courseId });
      mostRecentResumeCourse = {
        courseId: enrollments[0].courseId,
        courseTitle: enrollments[0].courseTitle || firstCourse?.title || "Course",
        progressPercentage: 100,
        thumbnail: firstCourse?.thumbnail || undefined,
      };
    }

    const certificatesCount = await CertificateModel.countDocuments({
      studentId,
      status: "valid",
    });

    return {
      enrolledCount,
      activeCount,
      completedCount,
      certificatesCount,
      resumeCourse: mostRecentResumeCourse,
      nextClass: null, // No live session backend exists in TOTC
    };
  }

  async getActiveCoursesByUserId(userId: string): Promise<ActiveCourse[]> {
    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });

    const studentId = user?.id || userId;
    const studentEmail = user?.email || userId;

    const enrollments = await EnrollmentModel.find({
      $or: [{ studentId }, { studentEmail }],
      status: "completed",
    }).sort({ createdAt: -1 });

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const activeCourses: ActiveCourse[] = [];

    for (const e of enrollments) {
      const course = await CourseModel.findOne({ id: e.courseId });
      const lessons = await LessonModel.find({ courseId: e.courseId }).sort({ order: 1 });
      const totalLessons = lessons.length;

      const progressRecords = await LessonProgressModel.find({
        studentId,
        courseId: e.courseId,
      });

      const completedMap = new Map(
        progressRecords.map((p) => [p.lessonId, p.completed]),
      );

      const completedLessons = lessons.filter((l) => completedMap.get(l.id)).length;
      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const nextIncompleteLesson = lessons.find((l) => !completedMap.get(l.id));

      const nextLessonTitle = nextIncompleteLesson
        ? `${nextIncompleteLesson.order}. ${nextIncompleteLesson.title}`
        : totalLessons > 0
          ? "All lessons completed 🎉"
          : "Curriculum coming soon";

      activeCourses.push({
        id: e.courseId || e.id,
        title: e.courseTitle || course?.title || "Course",
        category: course?.category || "General",
        progress: progressPercentage,
        modulesCompleted:
          totalLessons > 0
            ? `${completedLessons} / ${totalLessons} Lessons`
            : "0 Lessons",
        instructor: (course as any)?.instructor || course?.createdBy || "Instructor",
        image:
          course?.thumbnail ||
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        nextLesson: nextLessonTitle,
        lastLessonId: nextIncompleteLesson?.id || lessons[0]?.id,
      });
    }

    return activeCourses;
  }

  async getCoursesCatalog(): Promise<CatalogCourse[]> {
    const courses = await CourseModel.find({ status: "published" as any }).sort({
      createdAt: -1,
    });

    if (courses.length === 0) {
      const allCourses = await CourseModel.find().sort({ createdAt: -1 });
      return allCourses.map((c) => ({
        id: c.id ?? c._id.toString(),
        title: c.title,
        description: c.description,
        label: c.category || "General",
        accent: "bg-blue-500/10 text-blue-600 border-blue-200",
      }));
    }

    return courses.map((c) => ({
      id: c.id ?? c._id.toString(),
      title: c.title,
      description: c.description,
      label: c.category || "General",
      accent: "bg-blue-500/10 text-blue-600 border-blue-200",
    }));
  }

  async enrollCourse(userId: string, courseId: string): Promise<void> {
    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });

    if (!user) throw new Error("User not found.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    // Idempotent — skip if already enrolled
    const existing = await EnrollmentModel.findOne({
      studentId: user.id || userId,
      courseId,
    });
    if (existing) return;

    const enrollment = new EnrollmentModel({
      id: randomUUID(),
      studentId: user.id || userId,
      studentName: user.name,
      studentEmail: user.email,
      courseId,
      courseTitle: course.title,
      amountPaid: course.price || 0,
      paymentMethod: "Online",
      status: "completed",
    });

    await enrollment.save();
  }
}
