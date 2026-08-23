import type { IInstructorRepository, InstructorCourseSummaryDto } from "../interface/IInstructorRepository";

export class GetInstructorCoursesUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(instructorId: string, status?: string): Promise<InstructorCourseSummaryDto[]> {
    if (!instructorId) throw new Error("Instructor ID is required.");
    return this.instructorRepository.getCourses(instructorId, status);
  }
}
