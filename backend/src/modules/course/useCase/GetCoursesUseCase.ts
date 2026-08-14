import type { ICourseRepository } from "../interface/ICourseRepository";
import { Course } from "../entity/Course";

export class GetCoursesUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(): Promise<Course[]> {
    return this.courseRepository.findAll();
  }
}
