import type { ICourseRepository } from "../interface/ICourseRepository";
import { NotFoundError } from "../../../core/errors/AppError";

export class DeleteCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(id: string): Promise<void> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");
    }

    await this.courseRepository.delete(id);
  }
}
