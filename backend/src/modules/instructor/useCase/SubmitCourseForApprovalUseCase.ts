import type { IInstructorRepository, InstructorCourseSummaryDto } from "../interface/IInstructorRepository";

export class SubmitCourseForApprovalUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(
    courseId: string,
    instructorId: string,
  ): Promise<{ success: boolean; message: string; course: InstructorCourseSummaryDto }> {
    if (!courseId) throw new Error("Course ID is required.");
    if (!instructorId) throw new Error("Instructor ID is required.");

    return this.instructorRepository.submitCourseForApproval(courseId, instructorId);
  }
}
