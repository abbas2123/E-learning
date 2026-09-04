import type { IDashboardRepository } from "../interface/IDashboardRepository";
import type { DashboardSummaryDto } from "../dtos/DashboardSummaryDto";
import { UnauthorizedError } from "../../../core/errors/AppError";

export class GetDashboardSummaryUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(userId: string): Promise<DashboardSummaryDto> {
    if (!userId) {
      throw new UnauthorizedError();
    }
    return await this.dashboardRepository.getSummaryByUserId(userId);
  }
}

