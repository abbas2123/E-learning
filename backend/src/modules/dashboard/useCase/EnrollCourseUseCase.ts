import type { IDashboardRepository } from "../interface/IDashboardRepository";

export class EnrollCourseUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(userId: string, courseId: string): Promise<void> {
    if (!userId) throw new Error("User not authenticated.");
    if (!courseId) throw new Error("Course ID is required.");
    await this.dashboardRepository.enrollCourse(userId, courseId);
  }
}
