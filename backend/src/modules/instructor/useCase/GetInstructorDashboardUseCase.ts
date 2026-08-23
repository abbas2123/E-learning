import type { IInstructorRepository, InstructorDashboardStatsDto } from "../interface/IInstructorRepository";

export class GetInstructorDashboardUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(instructorId: string): Promise<InstructorDashboardStatsDto> {
    if (!instructorId) throw new Error("Instructor ID is required.");
    return this.instructorRepository.getDashboardStats(instructorId);
  }
}
