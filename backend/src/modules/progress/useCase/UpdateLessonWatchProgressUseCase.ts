import type {
  ILessonProgressRepository,
  LessonProgressDto,
} from "../interface/ILessonProgressRepository";
import type { ICourseRepository } from "../../course/interface/ICourseRepository";
import type { ILessonRepository } from "../../curriculum/interface/ILessonRepository";
import type { IEnrollmentRepository } from "../../admin/interface/IEnrollmentRepository";
import { VIDEO_COMPLETION_THRESHOLD } from "../../../shared/constants/courseConstants";
import {
  EnrollmentRequiredError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

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
    private readonly courseRepository?: ICourseRepository,
    private readonly lessonRepository?: ILessonRepository,
    private readonly enrollmentRepository?: IEnrollmentRepository,
  ) {}

  async execute(
    input: UpdateLessonWatchProgressInput,
  ): Promise<LessonProgressDto> {
    const { userId, courseId, lessonId, watchedSeconds, userRole } = input;

    if (!userId) throw new UnauthorizedError();
    if (!courseId) throw new ValidationError("Course ID is required.");
    if (!lessonId) throw new ValidationError("Lesson ID is required.");
    if (!Number.isFinite(watchedSeconds) || watchedSeconds < 0) {
      throw new ValidationError("watchedSeconds must be a non-negative number.");
    }

    // Validate course via repository
    let courseCreatedBy: string | undefined;
    if (this.courseRepository) {
      const course = await this.courseRepository.findSummaryById(courseId);
      if (!course) throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");
      courseCreatedBy = course.createdBy;
    }

    // Validate lesson belongs to course via repository
    let lessonDuration: number | undefined;
    if (this.lessonRepository) {
      const lesson = await this.lessonRepository.findById(lessonId);
      if (!lesson) throw new NotFoundError("Lesson not found.", "LESSON_NOT_FOUND");
      if (lesson.courseId !== courseId) {
        throw new ValidationError("Lesson does not belong to this course.");
      }
      lessonDuration = lesson.duration;
    }

    // Enrollment check via repository
    const isAdminOrOwner = userRole === "admin" || courseCreatedBy === userId;
    if (!isAdminOrOwner && this.enrollmentRepository) {
      const enrolled = await this.enrollmentRepository.isStudentEnrolled(userId, courseId);
      if (!enrolled) {
        throw new EnrollmentRequiredError("Active enrollment is required to update lesson progress.");
      }
    }

    const existing = await this.progressRepository.findByLesson(userId, courseId, lessonId);

    const durationSeconds = Math.max(1, (lessonDuration || 1) * 60);
    // Clamp: prevent client from reporting time beyond the video duration
    const clampedWatchedSeconds = Math.min(durationSeconds, Math.max(0, watchedSeconds));
    // Never regress: keep the highest recorded position
    const newWatchedSeconds = existing
      ? Math.min(durationSeconds, Math.max(existing.watchedSeconds, clampedWatchedSeconds))
      : clampedWatchedSeconds;

    const requiredSeconds = Math.floor(durationSeconds * VIDEO_COMPLETION_THRESHOLD);
    const isCompleted = existing?.completed || newWatchedSeconds >= requiredSeconds;

    return this.progressRepository.upsertProgress({
      studentId: userId,
      courseId,
      lessonId,
      watchedSeconds: newWatchedSeconds,
      completed: isCompleted,
      completedAt: isCompleted ? existing?.completedAt || new Date() : null,
    });
  }
}
