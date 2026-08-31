import type { ICourseRepository, CourseFilterParams } from "../interface/ICourseRepository";
import { Course } from "../entity/Course";

export class GetCoursesUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(filter?: CourseFilterParams): Promise<Course[]> {
    const effectiveFilter: CourseFilterParams = {
      status: filter?.status || "published",
      category: filter?.category,
      search: filter?.search,
    };
    return this.courseRepository.findAll(effectiveFilter);
  }
}
