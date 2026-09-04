import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface DeleteLessonInput {
  lessonId: string;
  userId: string;
  userRole?: string;
}

export class DeleteLessonUseCase {
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(input: DeleteLessonInput): Promise<boolean> {
    const { lessonId, userId, userRole } = input;

    if (!lessonId) throw new ValidationError("Lesson ID is required.");

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson not found.", "LESSON_NOT_FOUND");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: lesson.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("Unauthorized to delete this lesson.");
      }
    }

    const deleted = await this.lessonRepository.deleteLesson(lessonId);
    if (!deleted) throw new NotFoundError("Failed to delete lesson.", "LESSON_NOT_FOUND");
    return true;
  }
}

