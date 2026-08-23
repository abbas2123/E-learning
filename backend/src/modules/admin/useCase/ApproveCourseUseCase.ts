import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminCourseDto } from "../dtos/AdminCourseDto";

export class ApproveCourseUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(courseId: string): Promise<AdminCourseDto> {
    if (!courseId) {
      throw new Error("Course ID is required.");
    }
    return this.adminRepository.approveCourse(courseId);
  }
}
