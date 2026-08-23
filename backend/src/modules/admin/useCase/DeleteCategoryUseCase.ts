import type { IAdminRepository } from "../interface/IAdminRepository";

export class DeleteCategoryUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(categoryId: string): Promise<void> {
    if (!categoryId) {
      throw new Error("Category ID is required.");
    }
    return this.adminRepository.deleteCategory(categoryId);
  }
}
