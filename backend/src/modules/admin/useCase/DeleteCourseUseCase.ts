import type { IAdminRepository } from "../interface/IAdminRepository";
import { ValidationError } from "../../../core/errors/AppError";

export class DeleteCourseUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(courseId: string): Promise<void> {
    if (!courseId) {
      throw new ValidationError("Course ID is required.");
    }
    return this.adminRepository.deleteCourse(courseId);
  }
}

