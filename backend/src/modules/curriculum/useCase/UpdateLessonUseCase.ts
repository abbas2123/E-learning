import type { LessonResourceDto } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import type { LessonDto } from "../interface/ISectionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface UpdateLessonInput {
  lessonId: string;
  title?: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
  resources?: LessonResourceDto[];
  userId: string;
  userRole?: string;
}

export class UpdateLessonUseCase {
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(input: UpdateLessonInput): Promise<LessonDto> {
    const {
      lessonId,
      title,
      description,
      type,
      videoUrl,
      duration,
      order,
      isPreview,
      resources,
      userId,
      userRole,
    } = input;

    if (!lessonId) throw new ValidationError("Lesson ID is required.");

    const existingLesson = await this.lessonRepository.findById(lessonId);
    if (!existingLesson) throw new NotFoundError("Lesson not found.", "LESSON_NOT_FOUND");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: existingLesson.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("Unauthorized to modify this lesson.");
      }
    }

    const updated = await this.lessonRepository.updateLesson(lessonId, {
      title,
      description,
      type,
      videoUrl,
      duration,
      order,
      isPreview,
      resources,
    });

    if (!updated) throw new NotFoundError("Failed to update lesson.", "LESSON_NOT_FOUND");
    return updated;
  }
}
