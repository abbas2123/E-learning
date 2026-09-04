import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminCourseDto } from "../dtos/AdminCourseDto";
import { ValidationError } from "../../../core/errors/AppError";

export class RejectCourseUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(courseId: string, reason: string): Promise<AdminCourseDto> {
    if (!courseId) {
      throw new ValidationError("Course ID is required.");
    }
    return this.adminRepository.rejectCourse(courseId, reason);
  }
}

