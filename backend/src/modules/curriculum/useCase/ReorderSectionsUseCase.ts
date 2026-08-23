import type { ISectionRepository, SectionDto } from "../interface/ISectionRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface ReorderSectionsInput {
  courseId: string;
  orderedSectionIds: string[];
  userId: string;
  userRole?: string;
}

export class ReorderSectionsUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(input: ReorderSectionsInput): Promise<SectionDto[]> {
    const { courseId, orderedSectionIds, userId, userRole } = input;

    if (!courseId) throw new Error("Course ID is required.");
    if (!Array.isArray(orderedSectionIds) || orderedSectionIds.length === 0) {
      throw new Error("orderedSectionIds array is required.");
    }

    // Check duplicate IDs in input array
    const uniqueIds = new Set(orderedSectionIds);
    if (uniqueIds.size !== orderedSectionIds.length) {
      throw new Error("Duplicate section IDs detected in reorder payload.");
    }

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    if (userRole !== "admin" && course.createdBy !== userId) {
      throw new Error("Unauthorized to reorder sections for this course.");
    }

    const existingSections = await this.sectionRepository.findByCourseId(courseId);
    const existingSectionIds = new Set(existingSections.map((s) => s.id));

    for (const id of orderedSectionIds) {
      if (!existingSectionIds.has(id)) {
        throw new Error(`Section with ID ${id} does not belong to course ${courseId}.`);
      }
    }

    return this.sectionRepository.reorderSections(courseId, orderedSectionIds);
  }
}
