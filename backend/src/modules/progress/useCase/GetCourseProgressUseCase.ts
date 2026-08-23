import type {
  ILessonProgressRepository,
  CourseProgressSummaryDto,
} from "../interface/ILessonProgressRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { LessonModel } from "../../curriculum/database/Lesson";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";

export interface GetCourseProgressInput {
  userId: string;
  courseId: string;
  userRole?: string;
}

export class GetCourseProgressUseCase {
  constructor(
    private readonly progressRepository: ILessonProgressRepository,
  ) {}

  async execute(input: GetCourseProgressInput): Promise<CourseProgressSummaryDto> {
    const { userId, courseId, userRole } = input;

    if (!userId) throw new Error("Authentication required.");
    if (!courseId) throw new Error("Course ID is required.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    if (userRole !== "admin" && course.createdBy !== userId) {
      const enrollment = await EnrollmentModel.findOne({
        studentId: userId,
        courseId,
        status: "completed",
      });
      if (!enrollment) {
        throw new Error("Access denied. Active enrollment required to view course progress.");
      }
    }

    // 1 Query for all lessons in this course
    const lessons = await LessonModel.find({ courseId }).select("id order title").sort({ order: 1 });
    const totalLessons = lessons.length;

    // 1 Query for all progress records of this student in this course
    const progressRecords = await this.progressRepository.findByCourse(userId, courseId);

    const progressMap = new Map<string, typeof progressRecords[0]>();
    for (const record of progressRecords) {
      progressMap.set(record.lessonId, record);
    }

    let completedLessons = 0;
    const lessonProgressList = lessons.map((l) => {
      const p = progressMap.get(l.id);
      const isComp = Boolean(p?.completed);
      if (isComp) completedLessons++;

      return {
        lessonId: l.id,
        completed: isComp,
        watchedSeconds: p?.watchedSeconds ?? 0,
        completedAt: p?.completedAt ?? null,
      };
    });

    const progressPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const isCourseCompleted = totalLessons > 0 && completedLessons === totalLessons;

    return {
      courseId,
      totalLessons,
      completedLessons,
      progressPercentage,
      completed: isCourseCompleted,
      lessons: lessonProgressList,
    };
  }
}
