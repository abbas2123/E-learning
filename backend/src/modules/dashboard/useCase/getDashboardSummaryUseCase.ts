import type { IDashboardRepository } from "../interface/IDashboardRepository";
import type { DashboardSummaryDto } from "../dtos/DashboardSummaryDto";

export class GetDashboardSummaryUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(userId: string): Promise<DashboardSummaryDto> {
    if (!userId) {
      throw new Error("User ID is required.");
    }
    return await this.dashboardRepository.getSummaryByUserId(userId);
  }
}
