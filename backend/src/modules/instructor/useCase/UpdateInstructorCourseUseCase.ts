import type {
  IInstructorRepository,
  UpdateInstructorCourseParams,
  InstructorCourseSummaryDto,
} from "../interface/IInstructorRepository";

export class UpdateInstructorCourseUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(
    courseId: string,
    instructorId: string,
    params: UpdateInstructorCourseParams,
  ): Promise<InstructorCourseSummaryDto> {
    if (!courseId) throw new Error("Course ID is required.");
    if (!instructorId) throw new Error("Instructor ID is required.");

    const updated = await this.instructorRepository.updateCourse(courseId, instructorId, params);
    if (!updated) {
      throw new Error("Course not found or unauthorized to update.");
    }
    return updated;
  }
}
