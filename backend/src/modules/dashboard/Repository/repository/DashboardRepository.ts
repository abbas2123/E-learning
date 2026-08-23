import { randomUUID } from "crypto";
import type {
  IDashboardRepository,
  DashboardSummary,
  ActiveCourse,
  CatalogCourse,
} from "../../interface/IDashboardRepository";
import { UserModel } from "../../../auth/Repository/database/User";
import { CourseModel } from "../../../course/repository/database/Course";
import { EnrollmentModel } from "../../../admin/Repository/database/Enrollment";

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
    const firstEnrollment = enrollments[0];

    return {
      enrolledCount,
      activeCount: enrolledCount,
      userGpa: "3.90",
      nextClass: firstEnrollment
        ? {
            title: firstEnrollment.courseTitle,
            instructor: "Course Instructor",
            room: "#classroom-live-1",
            startTime: "Today 2:00 PM",
            avatar:
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
          }
        : undefined,
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
    });

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const activeCourses: ActiveCourse[] = [];
    for (const e of enrollments) {
      const course = await CourseModel.findOne({ id: e.courseId });
      activeCourses.push({
        id: e.courseId || e.id,
        title: e.courseTitle || course?.title || "Course",
        category: course?.category || "Development",
        progress: 50,
        modulesCompleted: "1 / 4 Modules",
        instructor: (course as any)?.instructor || course?.createdBy || "Instructor",
        image:
          course?.thumbnail ||
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        nextLesson: "Lesson 1: Introduction",
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
