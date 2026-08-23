import type { ISectionRepository } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";

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

    if (!sectionId) throw new Error("Section ID is required.");

    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new Error("Section not found.");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: section.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Unauthorized to delete this section.");
      }
    }

    // Cascade delete child lessons first
    await this.lessonRepository.deleteLessonsBySectionId(sectionId);

    const deleted = await this.sectionRepository.deleteSection(sectionId);
    if (!deleted) throw new Error("Failed to delete section.");
    return true;
  }
}
