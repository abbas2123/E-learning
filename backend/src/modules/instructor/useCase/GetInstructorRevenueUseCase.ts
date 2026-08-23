import type { IInstructorRepository, InstructorRevenueDto } from "../interface/IInstructorRepository";

export class GetInstructorRevenueUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(instructorId: string): Promise<InstructorRevenueDto> {
    if (!instructorId) throw new Error("Instructor ID is required.");
    return this.instructorRepository.getRevenue(instructorId);
  }
}
