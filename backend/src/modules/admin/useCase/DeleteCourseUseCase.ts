import type { IAdminRepository } from "../interface/IAdminRepository";

export class DeleteCourseUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(courseId: string): Promise<void> {
    if (!courseId) {
      throw new Error("Course ID is required.");
    }
    return this.adminRepository.deleteCourse(courseId);
  }
}
