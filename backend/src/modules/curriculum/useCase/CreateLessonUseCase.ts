import type { ISectionRepository, LessonDto } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface CreateLessonInput {
  sectionId: string;
  title: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
  userId: string;
  userRole?: string;
}

export class CreateLessonUseCase {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(input: CreateLessonInput): Promise<LessonDto> {
    const {
      sectionId,
      title,
      description,
      type,
      videoUrl,
      duration,
      order,
      isPreview,
      userId,
      userRole,
    } = input;

    if (!sectionId) throw new ValidationError("Section ID is required.");
    if (!title || !title.trim()) throw new ValidationError("Lesson title is required.");

    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new NotFoundError("Parent section not found.", "SECTION_NOT_FOUND");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: section.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("Unauthorized to add lessons to this section.");
      }
    }

    return this.lessonRepository.createLesson({
      sectionId,
      courseId: section.courseId,
      title: title.trim(),
      description,
      type: type || "video",
      videoUrl,
      duration: duration || 0,
      order,
      isPreview: Boolean(isPreview),
    });
  }
}
