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
  VideoWatchTimeInsufficientError,
} from "../../../core/errors/AppError";

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
    private readonly courseRepository?: ICourseRepository,
    private readonly lessonRepository?: ILessonRepository,
    private readonly enrollmentRepository?: IEnrollmentRepository,
  ) {}

  async execute(input: MarkLessonCompleteInput): Promise<LessonProgressDto> {
    const { userId, courseId, lessonId, watchedSeconds, userRole } = input;

    if (!userId) throw new UnauthorizedError();
    if (!courseId) throw new ValidationError("Course ID is required.");
    if (!lessonId) throw new ValidationError("Lesson ID is required.");

    // Validate course exists and get createdBy for authorization
    let courseCreatedBy: string | undefined;
    if (this.courseRepository) {
      const course = await this.courseRepository.findSummaryById(courseId);
      if (!course)
        throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");
      courseCreatedBy = course.createdBy;
    }

    // Resolve the lesson (which may be a quiz-type or video lesson)
    let lessonType: string | undefined;
    let lessonDuration: number | undefined;

    if (this.lessonRepository) {
      const lesson = await this.lessonRepository.findById(lessonId);
      if (!lesson) {
        // Might be a quiz lesson referenced by quiz ID — try quiz-or-lesson lookup
        const quizLesson = await this.lessonRepository.findByQuizOrLessonId(
          courseId,
          lessonId,
        );
        if (!quizLesson)
          throw new NotFoundError(
            "Lesson or assessment not found.",
            "LESSON_NOT_FOUND",
          );
        if (quizLesson.courseId !== courseId) {
          throw new ValidationError("Lesson does not belong to this course.");
        }
        lessonType = quizLesson.type;
        lessonDuration = quizLesson.duration;
      } else {
        if (lesson.courseId !== courseId) {
          throw new ValidationError("Lesson does not belong to this course.");
        }
        lessonType = lesson.type;
        lessonDuration = lesson.duration;
      }
    }

    // Enrollment check: must be enrolled unless admin or course creator
    const isAdminOrOwner = userRole === "admin" || courseCreatedBy === userId;
    if (!isAdminOrOwner && this.enrollmentRepository) {
      const enrolled = await this.enrollmentRepository.isStudentEnrolled(
        userId,
        courseId,
      );
      if (!enrolled) {
        throw new EnrollmentRequiredError(
          "Active enrollment is required to complete lessons.",
        );
      }
    }

    const durationSeconds = Math.max(1, (lessonDuration || 1) * 60);
    const requiredSeconds = Math.floor(
      durationSeconds * VIDEO_COMPLETION_THRESHOLD,
    );
    const existingProgress = await this.progressRepository.findByLesson(
      userId,
      courseId,
      lessonId,
    );
    const currentWatch =
      watchedSeconds !== undefined
        ? Math.min(durationSeconds, Math.max(0, watchedSeconds))
        : (existingProgress?.watchedSeconds ??
          (lessonType === "video" ? 0 : durationSeconds));

    if (lessonType === "video" && !isAdminOrOwner) {
      if (currentWatch < requiredSeconds) {
        throw new VideoWatchTimeInsufficientError(
          `Video lesson incomplete (${currentWatch}s watched of ${durationSeconds}s). Minimum ${Math.round(VIDEO_COMPLETION_THRESHOLD * 100)}% (${requiredSeconds}s) watch time required before completing.`,
        );
      }
    }

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
