import type {
  ISectionRepository,
  SectionDto,
} from "../interface/ISectionRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface UpdateSectionInput {
  sectionId: string;
  title?: string;
  description?: string;
  order?: number;
  userId: string;
  userRole?: string;
}

export class UpdateSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(input: UpdateSectionInput): Promise<SectionDto> {
    const { sectionId, title, description, order, userRole, userId } = input;

    if (!sectionId) throw new Error("Section ID is required.");

    const existingSection = await this.sectionRepository.findById(sectionId);
    if (!existingSection) throw new Error("Section not found.");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: existingSection.courseId });
      if (!course || (course.createdBy !== userId)) {
        throw new Error("Unauthorized to modify this section.");
      }
    }

    const updated = await this.sectionRepository.updateSection(sectionId, {
      title,
      description,
      order,
    });

    if (!updated) throw new Error("Failed to update section.");
    return updated;
  }
}
