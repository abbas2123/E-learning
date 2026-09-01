import type { ISectionRepository } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface DeleteSectionInput {
  sectionId: string;
  userId: string;
  userRole?: string;
}

export class DeleteSectionUseCase {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(input: DeleteSectionInput): Promise<boolean> {
    const { sectionId, userId, userRole } = input;

    if (!sectionId) throw new ValidationError("Section ID is required.");

    const section = await this.sectionRepository.findById(sectionId);
    if (!section)
      throw new NotFoundError("Section not found.", "SECTION_NOT_FOUND");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: section.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to delete this section.");
      }
    }

    // Cascade delete child lessons first
    await this.lessonRepository.deleteLessonsBySectionId(sectionId);

    const deleted = await this.sectionRepository.deleteSection(sectionId);
    if (!deleted) throw new Error("Failed to delete section.");
    return true;
  }
}
