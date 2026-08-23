import type { IInstructorRepository, InstructorCourseSummaryDto } from "../interface/IInstructorRepository";

export class GetInstructorCourseUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(courseId: string, instructorId?: string, userRole?: string): Promise<InstructorCourseSummaryDto> {
    if (!courseId) throw new Error("Course ID is required.");

    const filterInstructorId = userRole === "admin" ? undefined : instructorId;
    const course = await this.instructorRepository.getCourseById(courseId, filterInstructorId);

    if (!course) {
      throw new Error("Course not found or unauthorized.");
    }

    return course;
  }
}
