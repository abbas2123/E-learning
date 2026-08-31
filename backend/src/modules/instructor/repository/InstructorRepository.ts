import { randomUUID } from "crypto";
import { CourseModel, CourseStatus, CourseLevel } from "../../course/repository/database/Course";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { ReviewModel } from "../../review/database/Review";
import { UserModel } from "../../auth/Repository/database/User";
import { SectionModel } from "../../curriculum/database/Section";
import { LessonModel } from "../../curriculum/database/Lesson";
import { LessonProgressModel } from "../../progress/database/LessonProgress";
import { NotificationModel } from "../../admin/Repository/database/Notification";
import type {
  IInstructorRepository,
  InstructorCourseSummaryDto,
  InstructorDashboardStatsDto,
  InstructorPaginatedStudentsDto,
  InstructorRevenueDto,
  InstructorAnalyticsDto,
  CreateInstructorCourseParams,
  UpdateInstructorCourseParams,
} from "../interface/IInstructorRepository";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class InstructorRepository implements IInstructorRepository {
  private async buildCourseSummary(doc: any): Promise<InstructorCourseSummaryDto> {
    const courseId = doc.id;
    const [enrollments, reviews] = await Promise.all([
      EnrollmentModel.find({ courseId, status: "completed" }),
      ReviewModel.find({ courseId }),
    ]);

    const revenue = enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    const studentCount = enrollments.length;
    const ratingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = reviews.length > 0 ? Number((ratingSum / reviews.length).toFixed(1)) : 5.0;

    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      thumbnail: doc.thumbnail ?? null,
      category: doc.category,
      level: doc.level as CourseLevel,
      price: doc.price ?? 0,
      discountPrice: doc.discountPrice ?? null,
      duration: doc.duration ?? 0,
      status: doc.status as CourseStatus,
      rejectionReason: doc.rejectionReason ?? null,
      createdBy: doc.createdBy,
      requirements: doc.requirements ?? [],
      learningOutcomes: doc.learningOutcomes ?? [],
      minCertificateScore: doc.minCertificateScore ?? 70,
      studentCount,
      rating: averageRating,
      reviewCount: reviews.length,
      revenue,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async getDashboardStats(instructorId: string): Promise<InstructorDashboardStatsDto> {
    const courses = await CourseModel.find({ createdBy: instructorId }).sort({ createdAt: -1 });
    const courseSummaries = await Promise.all(courses.map((c) => this.buildCourseSummary(c)));

    const courseIds = courses.map((c) => c.id);

    const [enrollments, reviews] = await Promise.all([
      EnrollmentModel.find({ courseId: { $in: courseIds }, status: "completed" }).sort({ createdAt: -1 }),
      ReviewModel.find({ courseId: { $in: courseIds } }),
    ]);

    const draftCourses = courses.filter((c) => c.status === CourseStatus.DRAFT).length;
    const pendingCourses = courses.filter((c) => c.status === CourseStatus.PENDING).length;
    const publishedCourses = courses.filter((c) => c.status === CourseStatus.PUBLISHED).length;
    const rejectedCourses = courses.filter((c) => c.status === CourseStatus.REJECTED).length;

    const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    const totalStudents = new Set(enrollments.map((e) => e.studentId)).size;

    const ratingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = reviews.length > 0 ? Number((ratingSum / reviews.length).toFixed(1)) : 5.0;

    const recentEnrollments = enrollments.slice(0, 5).map((e) => ({
      studentId: e.studentId,
      studentName: e.studentName,
      studentEmail: e.studentEmail,
      courseId: e.courseId,
      courseTitle: e.courseTitle,
      amountPaid: e.amountPaid,
      enrolledAt: (e as any).createdAt,
    }));

    return {
      totalCourses: courses.length,
      publishedCourses,
      pendingCourses,
      draftCourses,
      rejectedCourses,
      totalStudents,
      totalRevenue,
      averageRating,
      recentCourses: courseSummaries.slice(0, 5),
      recentEnrollments,
    };
  }

  async getCourses(instructorId: string, status?: string): Promise<InstructorCourseSummaryDto[]> {
    const query: any = { createdBy: instructorId };
    if (status && status !== "all") {
      query.status = status;
    }

    const docs = await CourseModel.find(query).sort({ createdAt: -1 });
    return Promise.all(docs.map((d) => this.buildCourseSummary(d)));
  }

  async getCourseById(courseId: string, instructorId?: string): Promise<InstructorCourseSummaryDto | null> {
    const query: any = { id: courseId };
    if (instructorId) {
      query.createdBy = instructorId;
    }

    const doc = await CourseModel.findOne(query);
    if (!doc) return null;
    return this.buildCourseSummary(doc);
  }

  async createCourse(
    instructorId: string,
    params: CreateInstructorCourseParams,
  ): Promise<InstructorCourseSummaryDto> {
    let baseSlug = slugify(params.title);
    let slug = baseSlug;
    let count = 1;

    while (await CourseModel.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const doc = await CourseModel.create({
      id: randomUUID(),
      title: params.title.trim(),
      slug,
      description: params.description.trim(),
      category: params.category.trim(),
      level: params.level || CourseLevel.BEGINNER,
      price: params.price ?? 0,
      thumbnail: params.thumbnail ?? null,
      duration: params.duration ?? 0,
      status: CourseStatus.DRAFT,
      createdBy: instructorId,
      requirements: params.requirements ?? [],
      learningOutcomes: params.learningOutcomes ?? [],
    });

    return this.buildCourseSummary(doc);
  }

  async updateCourse(
    courseId: string,
    instructorId: string,
    params: UpdateInstructorCourseParams,
  ): Promise<InstructorCourseSummaryDto | null> {
    const course = await CourseModel.findOne({ id: courseId, createdBy: instructorId });
    if (!course) return null;

    const updateFields: any = { ...params };
    if (params.title && params.title.trim() !== course.title) {
      let baseSlug = slugify(params.title);
      let slug = baseSlug;
      let count = 1;

      while (await CourseModel.findOne({ slug, id: { $ne: courseId } })) {
        slug = `${baseSlug}-${count++}`;
      }
      updateFields.slug = slug;
    }

    const doc = await CourseModel.findOneAndUpdate(
      { id: courseId, createdBy: instructorId },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!doc) return null;
    return this.buildCourseSummary(doc);
  }

  async submitCourseForApproval(
    courseId: string,
    instructorId: string,
  ): Promise<{ success: boolean; message: string; course: InstructorCourseSummaryDto }> {
    const course = await CourseModel.findOne({ id: courseId, createdBy: instructorId });
    if (!course) {
      throw new Error("Course not found or unauthorized.");
    }

    // Completeness validation checks
    if (!course.title?.trim()) throw new Error("Course title is required for submission.");
    if (!course.description?.trim()) throw new Error("Course description is required for submission.");
    if (!course.category?.trim()) throw new Error("Course category is required for submission.");

    const sections = await SectionModel.find({ courseId });
    if (sections.length === 0) {
      throw new Error("Course must have at least one curriculum section before submission.");
    }

    const lessons = await LessonModel.find({ courseId });
    if (lessons.length === 0) {
      throw new Error("Course must have at least one lesson before submission.");
    }

    // 1. Validate Video Lessons have valid video stream source
    for (const lesson of lessons) {
      if (lesson.type === "video" && (!lesson.videoUrl || !lesson.videoUrl.trim())) {
        throw new Error(
          `Video lesson "${lesson.title}" does not have a video URL or uploaded video. Please provide a video source.`,
        );
      }
    }

    // 2. Validate Quizzes & Questions
    const { QuizModel } = await import("../../quiz/database/Quiz");
    const { QuestionModel } = await import("../../quiz/database/Question");

    const quizzes = await QuizModel.find({ courseId });
    const quizLessons = lessons.filter((l) => l.type === "quiz");

    // Check all quiz lessons have a corresponding Quiz with questions
    for (const quizLesson of quizLessons) {
      const quiz = quizzes.find(
        (q) => q.id === quizLesson.quizId || q.lessonId === quizLesson.id || q.id === quizLesson.id,
      );
      if (!quiz) {
        throw new Error(
          `Knowledge quiz "${quizLesson.title}" has no quiz structure. Please add questions to the quiz before submitting.`,
        );
      }
    }

    // Check all quizzes have valid questions with options and correct answers
    for (const quiz of quizzes) {
      const questions = await QuestionModel.find({ quizId: quiz.id }).select("+correctOptionIds");
      if (questions.length === 0) {
        throw new Error(
          `Quiz "${quiz.title}" has 0 questions. Each quiz must contain at least 1 question before course submission.`,
        );
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText || !q.questionText.trim()) {
          throw new Error(`Question ${i + 1} in quiz "${quiz.title}" is missing question text.`);
        }
        if (!q.options || q.options.length < 2) {
          throw new Error(
            `Question "${q.questionText}" in quiz "${quiz.title}" must have at least 2 options.`,
          );
        }
        if (!q.correctOptionIds || q.correctOptionIds.length === 0) {
          throw new Error(
            `Question "${q.questionText}" in quiz "${quiz.title}" must have a designated correct answer.`,
          );
        }
      }
    }

    const updated = await CourseModel.findOneAndUpdate(
      { id: courseId, createdBy: instructorId },
      { $set: { status: CourseStatus.PENDING, rejectionReason: null } },
      { new: true },
    );

    if (!updated) throw new Error("Failed to submit course for approval.");

    // Issue system notification for admins
    try {
      await NotificationModel.create({
        id: randomUUID(),
        title: "Course Approval Requested",
        message: `Instructor submitted course "${updated.title}" for review.`,
        type: "approval",
        read: false,
      });
    } catch {
      // Ignore notification creation errors
    }

    const courseSummary = await this.buildCourseSummary(updated);
    return {
      success: true,
      message: "Course submitted for admin approval.",
      course: courseSummary,
    };
  }

  async getStudents(
    instructorId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<InstructorPaginatedStudentsDto> {
    const instructorCourses = await CourseModel.find({ createdBy: instructorId });
    const courseIds = instructorCourses.map((c) => c.id);

    const query: any = {
      courseId: { $in: courseIds },
      status: "completed",
    };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { studentName: searchRegex },
        { studentEmail: searchRegex },
        { courseTitle: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await EnrollmentModel.countDocuments(query);
    const enrollments = await EnrollmentModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch user avatars and progress
    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];
    const users = await UserModel.find({ id: { $in: studentIds } });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const resultStudents = await Promise.all(
      enrollments.map(async (e) => {
        const user = userMap.get(e.studentId);
        const courseLessons = await LessonModel.find({ courseId: e.courseId });
        const totalLessonsCount = courseLessons.length;

        const progressRecords = await LessonProgressModel.find({
          studentId: e.studentId,
          courseId: e.courseId,
          completed: true,
        });

        const completedLessonsCount = progressRecords.length;
        const progressPercentage =
          totalLessonsCount > 0
            ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
            : 0;

        let completionStatus: "not_started" | "in_progress" | "completed" = "not_started";
        if (progressPercentage >= 100) completionStatus = "completed";
        else if (progressPercentage > 0) completionStatus = "in_progress";

        return {
          studentId: e.studentId,
          studentName: e.studentName,
          studentEmail: e.studentEmail,
          avatar: user?.avatar ?? null,
          courseId: e.courseId,
          courseTitle: e.courseTitle,
          amountPaid: e.amountPaid,
          enrolledAt: (e as any).createdAt,
          completedLessonsCount,
          totalLessonsCount,
          progressPercentage,
          completionStatus,
        };
      }),
    );

    return {
      students: resultStudents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getRevenue(instructorId: string): Promise<InstructorRevenueDto> {
    const instructorCourses = await CourseModel.find({ createdBy: instructorId });
    const courseIds = instructorCourses.map((c) => c.id);

    const enrollments = await EnrollmentModel.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    const courseMap = new Map<string, { title: string; count: number; revenue: number }>();
    instructorCourses.forEach((c) => {
      courseMap.set(c.id, { title: c.title, count: 0, revenue: 0 });
    });

    enrollments.forEach((e) => {
      const amount = e.amountPaid || 0;
      totalRevenue += amount;

      const date = new Date((e as any).createdAt);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        thisMonthRevenue += amount;
      }
      if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
        lastMonthRevenue += amount;
      }

      const cData = courseMap.get(e.courseId);
      if (cData) {
        cData.count += 1;
        cData.revenue += amount;
      }
    });

    // Build monthly breakdown for last 6 months
    const monthlyBreakdown: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleString("default", { month: "short" });
      const mMonth = d.getMonth();
      const mYear = d.getFullYear();

      const monthRevenue = enrollments
        .filter((e) => {
          const ed = new Date((e as any).createdAt);
          return ed.getMonth() === mMonth && ed.getFullYear() === mYear;
        })
        .reduce((sum, e) => sum + (e.amountPaid || 0), 0);

      monthlyBreakdown.push({
        month: `${mName} ${mYear}`,
        amount: monthRevenue,
      });
    }

    const courseBreakdown = Array.from(courseMap.entries()).map(([courseId, val]) => ({
      courseId,
      title: val.title,
      enrollmentsCount: val.count,
      revenue: val.revenue,
    }));

    return {
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      monthlyBreakdown,
      courseBreakdown,
    };
  }

  async getAnalytics(instructorId: string): Promise<InstructorAnalyticsDto> {
    const instructorCourses = await CourseModel.find({ createdBy: instructorId });
    const courseIds = instructorCourses.map((c) => c.id);

    const [enrollments, reviews] = await Promise.all([
      EnrollmentModel.find({ courseId: { $in: courseIds }, status: "completed" }),
      ReviewModel.find({ courseId: { $in: courseIds } }),
    ]);

    const ratingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = reviews.length > 0 ? Number((ratingSum / reviews.length).toFixed(1)) : 5.0;

    const coursePerformance = await Promise.all(
      instructorCourses.map(async (c) => {
        const cEnrollments = enrollments.filter((e) => e.courseId === c.id);
        const cReviews = reviews.filter((r) => r.courseId === c.id);
        const cLessons = await LessonModel.find({ courseId: c.id });

        let totalProgressPctSum = 0;

        for (const e of cEnrollments) {
          const completedCount = await LessonProgressModel.countDocuments({
            studentId: e.studentId,
            courseId: c.id,
            completed: true,
          });
          const pct = cLessons.length > 0 ? (completedCount / cLessons.length) * 100 : 0;
          totalProgressPctSum += pct;
        }

        const avgCompletionRate =
          cEnrollments.length > 0 ? Math.round(totalProgressPctSum / cEnrollments.length) : 0;

        const cRatingSum = cReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const cAvgRating = cReviews.length > 0 ? Number((cRatingSum / cReviews.length).toFixed(1)) : 5.0;
        const cRevenue = cEnrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);

        return {
          courseId: c.id,
          title: c.title,
          students: cEnrollments.length,
          completionRate: avgCompletionRate,
          rating: cAvgRating,
          revenue: cRevenue,
        };
      }),
    );

    const totalCompletionRateSum = coursePerformance.reduce((sum, c) => sum + c.completionRate, 0);
    const averageCompletionRate =
      coursePerformance.length > 0
        ? Math.round(totalCompletionRateSum / coursePerformance.length)
        : 0;

    return {
      totalEnrollments: enrollments.length,
      averageCompletionRate,
      averageRating,
      totalReviews: reviews.length,
      coursePerformance,
    };
  }
}
