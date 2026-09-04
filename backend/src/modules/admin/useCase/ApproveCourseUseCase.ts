import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminCourseDto } from "../dtos/AdminCourseDto";
import { ValidationError } from "../../../core/errors/AppError";

export class ApproveCourseUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(courseId: string): Promise<AdminCourseDto> {
    if (!courseId) {
      throw new ValidationError("Course ID is required.");
    }
    return this.adminRepository.approveCourse(courseId);
  }
}

