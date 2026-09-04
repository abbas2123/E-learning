import type { IDashboardRepository } from "../interface/IDashboardRepository";
import type { ActiveCourseDto } from "../dtos/ActiveCourseDto";
import { UnauthorizedError } from "../../../core/errors/AppError";

export class GetUserActiveCoursesUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(userId: string): Promise<ActiveCourseDto[]> {
    if (!userId) {
      throw new UnauthorizedError();
    }
    return await this.dashboardRepository.getActiveCoursesByUserId(userId);
  }
}

