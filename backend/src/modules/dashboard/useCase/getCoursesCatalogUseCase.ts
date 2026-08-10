import type { IDashboardRepository } from "../interface/IDashboardRepository";
import type { CourseCatalogItemDto } from "../dtos/CourseCatalogItemDto";

export class GetCoursesCatalogUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<CourseCatalogItemDto[]> {
    return await this.dashboardRepository.getCoursesCatalog();
  }
}
