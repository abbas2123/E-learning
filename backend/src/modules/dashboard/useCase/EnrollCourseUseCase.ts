import type { IDashboardRepository } from "../interface/IDashboardRepository";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

export class EnrollCourseUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(userId: string, courseId: string): Promise<void> {
    if (!userId) throw new UnauthorizedError();
    if (!courseId) throw new ValidationError("Course ID is required.");

    const result = await this.dashboardRepository.enrollCourse(
      userId,
      courseId,
    );
    if (!result.userFound) {
      throw new NotFoundError("User not found.", "USER_NOT_FOUND");
    }
    if (!result.courseFound) {
      throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");
    }
    if (result.alreadyEnrolled) {
      throw new ConflictError(
        "You are already enrolled in this course.",
        "ALREADY_ENROLLED",
      );
    }
  }
}
