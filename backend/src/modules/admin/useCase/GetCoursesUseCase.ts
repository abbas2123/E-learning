import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminCourseDto } from "../dtos/AdminCourseDto";

export class GetCoursesUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminCourseDto[]> {
    return this.adminRepository.getCourses();
  }
}
