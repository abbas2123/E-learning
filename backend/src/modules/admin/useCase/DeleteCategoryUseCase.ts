import type { IAdminRepository } from "../interface/IAdminRepository";
import { ValidationError } from "../../../core/errors/AppError";

export class DeleteCategoryUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(categoryId: string): Promise<void> {
    if (!categoryId) {
      throw new ValidationError("Category ID is required.");
    }
    return this.adminRepository.deleteCategory(categoryId);
  }
}

