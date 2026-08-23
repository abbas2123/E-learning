import type { IInstructorRepository, InstructorPaginatedStudentsDto } from "../interface/IInstructorRepository";

export class GetInstructorStudentsUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<InstructorPaginatedStudentsDto> {
    if (!instructorId) throw new Error("Instructor ID is required.");
    const p = Math.max(1, page);
    const l = Math.min(100, Math.max(1, limit));

    return this.instructorRepository.getStudents(instructorId, p, l, search);
  }
}
