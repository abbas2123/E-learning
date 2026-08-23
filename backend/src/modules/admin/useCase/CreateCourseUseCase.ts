import type { IAdminRepository } from "../interface/IAdminRepository";
import type { CreateCourseDto } from "../dtos/CreateCourseDto";
import type { AdminCourseDto } from "../dtos/AdminCourseDto";

export class CreateCourseUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(data: CreateCourseDto): Promise<AdminCourseDto> {
    if (!data.title || !data.title.trim()) {
      throw new Error("Course title is required.");
    }
    return this.adminRepository.createCourse(data);
  }
}
