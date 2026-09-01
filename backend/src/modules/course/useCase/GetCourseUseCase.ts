import type { ICourseRepository } from "../interface/ICourseRepository";
import { Course } from "../entity/Course";
import { NotFoundError } from "../../../core/errors/AppError";

export class GetCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");
    }

    return course;
  }
}
