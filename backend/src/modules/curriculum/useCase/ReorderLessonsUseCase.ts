import type { ISectionRepository, LessonDto } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface ReorderLessonsInput {
  sectionId: string;
  orderedLessonIds: string[];
  userId: string;
  userRole?: string;
}

export class ReorderLessonsUseCase {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(input: ReorderLessonsInput): Promise<LessonDto[]> {
    const { sectionId, orderedLessonIds, userId, userRole } = input;

    if (!sectionId) throw new ValidationError("Section ID is required.");
    if (!Array.isArray(orderedLessonIds) || orderedLessonIds.length === 0) {
      throw new ValidationError("orderedLessonIds array is required.");
    }

    const uniqueIds = new Set(orderedLessonIds);
    if (uniqueIds.size !== orderedLessonIds.length) {
      throw new ValidationError("Duplicate lesson IDs detected in reorder payload.");
    }

    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new NotFoundError("Section not found.", "SECTION_NOT_FOUND");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: section.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("Unauthorized to reorder lessons in this section.");
      }
    }

    const existingLessons = await this.lessonRepository.findBySectionId(sectionId);
    const existingLessonIds = new Set(existingLessons.map((l) => l.id));

    for (const id of orderedLessonIds) {
      if (!existingLessonIds.has(id)) {
        throw new ValidationError(`Lesson with ID ${id} does not belong to section ${sectionId}.`);
      }
    }

    return this.lessonRepository.reorderLessons(sectionId, orderedLessonIds);
  }
}
