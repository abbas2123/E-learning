import type {
  ISectionRepository,
  SectionDto,
} from "../interface/ISectionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { UserModel } from "../../auth/Repository/database/User";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface CreateSectionInput {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  userId: string;
  userRole?: string;
}

export class CreateSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(input: CreateSectionInput): Promise<SectionDto> {
    const { courseId, title, description, order, userId, userRole } = input;

    if (!courseId) throw new ValidationError("Course ID is required.");
    if (!title || !title.trim())
      throw new ValidationError("Section title is required.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course)
      throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");

    // Authorization check: Admin or course creator
    if (userRole !== "admin") {
      const user = await UserModel.findOne({ id: userId });
      if (
        !user ||
        (course.createdBy !== user.id && course.createdBy !== userId)
      ) {
        throw new ForbiddenError(
          "You are not allowed to modify this course curriculum.",
        );
      }
    }

    return this.sectionRepository.createSection({
      courseId,
      title: title.trim(),
      description,
      order,
    });
  }
}
