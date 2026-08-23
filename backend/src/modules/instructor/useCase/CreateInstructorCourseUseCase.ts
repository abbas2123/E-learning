import type {
  IInstructorRepository,
  CreateInstructorCourseParams,
  InstructorCourseSummaryDto,
} from "../interface/IInstructorRepository";

export class CreateInstructorCourseUseCase {
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  async execute(
    instructorId: string,
    params: CreateInstructorCourseParams,
  ): Promise<InstructorCourseSummaryDto> {
    if (!instructorId) throw new Error("Instructor ID is required.");
    if (!params.title || !params.title.trim()) throw new Error("Course title is required.");
    if (!params.description || !params.description.trim()) throw new Error("Course description is required.");
    if (!params.category || !params.category.trim()) throw new Error("Course category is required.");

    return this.instructorRepository.createCourse(instructorId, params);
  }
}
