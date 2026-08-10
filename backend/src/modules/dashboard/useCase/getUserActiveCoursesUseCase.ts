import type { IDashboardRepository } from "../interface/IDashboardRepository";
import type { ActiveCourseDto } from "../dtos/ActiveCourseDto";

export class GetUserActiveCoursesUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(userId: string): Promise<ActiveCourseDto[]> {
    if (!userId) {
      throw new Error("User ID is required.");
    }
    return await this.dashboardRepository.getActiveCoursesByUserId(userId);
  }
}
