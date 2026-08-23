import type {
  ILessonProgressRepository,
  LessonProgressDto,
} from "../interface/ILessonProgressRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { LessonModel } from "../../curriculum/database/Lesson";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";

export interface UpdateLessonWatchProgressInput {
  userId: string;
  courseId: string;
  lessonId: string;
  watchedSeconds: number;
  userRole?: string;
}

export class UpdateLessonWatchProgressUseCase {
  constructor(
    private readonly progressRepository: ILessonProgressRepository,
  ) {}

  async execute(
    input: UpdateLessonWatchProgressInput,
  ): Promise<LessonProgressDto> {
    const { userId, courseId, lessonId, watchedSeconds, userRole } = input;

    if (!userId) throw new Error("Authentication required.");
    if (!courseId) throw new Error("Course ID is required.");
    if (!lessonId) throw new Error("Lesson ID is required.");
    if (typeof watchedSeconds !== "number" || watchedSeconds < 0) {
      throw new Error("watchedSeconds must be a non-negative number.");
    }

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    const lesson = await LessonModel.findOne({ id: lessonId });
    if (!lesson) throw new Error("Lesson not found.");

    if (lesson.courseId !== courseId) {
      throw new Error(`Lesson ${lessonId} does not belong to course ${courseId}.`);
    }

    if (userRole !== "admin" && course.createdBy !== userId) {
      const enrollment = await EnrollmentModel.findOne({
        studentId: userId,
        courseId,
        status: "completed",
      });
      if (!enrollment) {
        throw new Error("Access denied. Active enrollment required to update lesson progress.");
      }
    }

    const existing = await this.progressRepository.findByLesson(
      userId,
      courseId,
      lessonId,
    );

    // Maintain maximum watchedSeconds value (no accidental regression)
    const newWatchedSeconds = existing
      ? Math.max(existing.watchedSeconds, watchedSeconds)
      : watchedSeconds;

    return this.progressRepository.upsertProgress({
      studentId: userId,
      courseId,
      lessonId,
      watchedSeconds: newWatchedSeconds,
    });
  }
}
