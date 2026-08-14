import type { ICourseRepository } from "../interface/ICourseRepository";
import { Course } from "../entity/Course";

export class GetCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new Error("Course not found.");
    }

    return course;
  }
}
