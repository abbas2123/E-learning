import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminCategoryDto } from "../dtos/AdminCategoryDto";
import type { CreateCategoryDto } from "../dtos/CreateCategoryDto";

export class CreateCategoryUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(dto: CreateCategoryDto): Promise<AdminCategoryDto> {
    if (!dto.name) {
      throw new Error("Category name is required.");
    }
    return this.adminRepository.createCategory(dto);
  }
}
