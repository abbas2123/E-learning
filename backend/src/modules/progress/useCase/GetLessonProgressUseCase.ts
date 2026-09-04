import type {
  ILessonProgressRepository,
  LessonProgressDto,
} from "../interface/ILessonProgressRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { LessonModel } from "../../curriculum/database/Lesson";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import {
  EnrollmentRequiredError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface GetLessonProgressInput {
  userId: string;
  courseId: string;
  lessonId: string;
  userRole?: string;
}

export class GetLessonProgressUseCase {
  constructor(private readonly progressRepository: ILessonProgressRepository) {}

  async execute(input: GetLessonProgressInput): Promise<LessonProgressDto> {
    const { userId, courseId, lessonId, userRole } = input;

    if (!userId) throw new UnauthorizedError();
    if (!courseId) throw new ValidationError("Course ID is required.");
    if (!lessonId) throw new ValidationError("Lesson ID is required.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course)
      throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");

    const lesson = await LessonModel.findOne({ id: lessonId });
    if (!lesson) {
      // Check if it corresponds to a course quiz
      const { QuizModel } = await import("../../quiz/database/Quiz.js");
      const quiz = await QuizModel.findOne({ id: lessonId, courseId });
      if (!quiz) {
        throw new NotFoundError("Lesson not found.", "LESSON_NOT_FOUND");
      }
    } else if (lesson.courseId !== courseId) {
      throw new ValidationError("Lesson does not belong to this course.");
    }

    if (userRole !== "admin" && course.createdBy !== userId) {
      const enrollment = await EnrollmentModel.findOne({
        studentId: userId,
        courseId,
        status: "completed",
      });
      if (!enrollment) {
        throw new EnrollmentRequiredError(
          "Active enrollment is required to view progress.",
        );
      }
    }

    const progress = await this.progressRepository.findByLesson(
      userId,
      courseId,
      lessonId,
    );

    if (!progress) {
      return {
        id: "",
        studentId: userId,
        courseId,
        lessonId,
        completed: false,
        watchedSeconds: 0,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return progress;
  }
}
