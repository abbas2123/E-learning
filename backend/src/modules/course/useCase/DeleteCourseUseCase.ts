import type { ICourseRepository } from "../interface/ICourseRepository";

export class DeleteCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(id: string): Promise<void> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new Error("Course not found.");
    }

    await this.courseRepository.delete(id);
  }
}
