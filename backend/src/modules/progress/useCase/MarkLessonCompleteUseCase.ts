import type {
  ILessonProgressRepository,
  LessonProgressDto,
} from "../interface/ILessonProgressRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { LessonModel } from "../../curriculum/database/Lesson";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";

export interface MarkLessonCompleteInput {
  userId: string;
  courseId: string;
  lessonId: string;
  watchedSeconds?: number;
  userRole?: string;
}

export class MarkLessonCompleteUseCase {
  constructor(
    private readonly progressRepository: ILessonProgressRepository,
  ) {}

  async execute(input: MarkLessonCompleteInput): Promise<LessonProgressDto> {
    const { userId, courseId, lessonId, watchedSeconds, userRole } = input;

    if (!userId) throw new Error("Authentication required.");
    if (!courseId) throw new Error("Course ID is required.");
    if (!lessonId) throw new Error("Lesson ID is required.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    const lesson = await LessonModel.findOne({ id: lessonId });
    if (!lesson) throw new Error("Lesson not found.");

    if (lesson.courseId !== courseId) {
      throw new Error(`Lesson ${lessonId} does not belong to course ${courseId}.`);
    }

    // Enrollment check: must be enrolled unless admin or course creator
    if (userRole !== "admin" && course.createdBy !== userId) {
      const enrollment = await EnrollmentModel.findOne({
        studentId: userId,
        courseId,
        status: "completed",
      });
      if (!enrollment) {
        throw new Error("Access denied. Active enrollment required to complete lessons.");
      }
    }

    const currentWatch =
      watchedSeconds !== undefined
        ? Math.max(0, watchedSeconds)
        : (await this.progressRepository.findByLesson(userId, courseId, lessonId))
            ?.watchedSeconds ?? (lesson.duration ? lesson.duration * 60 : 0);

    return this.progressRepository.upsertProgress({
      studentId: userId,
      courseId,
      lessonId,
      completed: true,
      watchedSeconds: currentWatch,
      completedAt: new Date(),
    });
  }
}
