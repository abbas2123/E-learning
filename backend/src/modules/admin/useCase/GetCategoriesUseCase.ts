import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminCategoryDto } from "../dtos/AdminCategoryDto";

export class GetCategoriesUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminCategoryDto[]> {
    return this.adminRepository.getCategories();
  }
}
