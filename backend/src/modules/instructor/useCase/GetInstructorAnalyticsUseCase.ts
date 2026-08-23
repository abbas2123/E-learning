import type { IInstructorRepository, InstructorAnalyticsDto } from "../interface/IInstructorRepository";

export class GetInstructorAnalyticsUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(instructorId: string): Promise<InstructorAnalyticsDto> {
    if (!instructorId) throw new Error("Instructor ID is required.");
    return this.instructorRepository.getAnalytics(instructorId);
  }
}
