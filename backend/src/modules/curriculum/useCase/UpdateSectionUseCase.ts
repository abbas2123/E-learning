import type {
  ISectionRepository,
  SectionDto,
} from "../interface/ISectionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface UpdateSectionInput {
  sectionId: string;
  title?: string;
  description?: string;
  order?: number;
  userRole?: string;
  userId?: string;
}

export class UpdateSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(input: UpdateSectionInput): Promise<SectionDto> {
    const { sectionId, title, description, order, userRole, userId } = input;

    if (!sectionId) throw new ValidationError("Section ID is required.");

    const existingSection = await this.sectionRepository.findById(sectionId);
    if (!existingSection) throw new NotFoundError("Section not found.", "SECTION_NOT_FOUND");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: existingSection.courseId });
      if (!course || (course.createdBy !== userId)) {
        throw new ForbiddenError("Unauthorized to modify this section.");
      }
    }

    const updated = await this.sectionRepository.updateSection(sectionId, {
      title,
      description,
      order,
    });

    if (!updated) throw new NotFoundError("Failed to update section.", "SECTION_NOT_FOUND");
    return updated;
  }
}
