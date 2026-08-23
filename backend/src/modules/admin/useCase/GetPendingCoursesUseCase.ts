import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminCourseDto } from "../dtos/AdminCourseDto";

export class GetPendingCoursesUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminCourseDto[]> {
    return this.adminRepository.getPendingCourses();
  }
}
