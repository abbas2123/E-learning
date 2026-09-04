import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminUserDto } from "../dtos/AdminUserDto";
import { ValidationError } from "../../../core/errors/AppError";

export class UpdateUserRoleUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(userId: string, role: string): Promise<AdminUserDto> {
    if (!userId) throw new ValidationError("User ID is required.");
    if (!role) throw new ValidationError("Role is required.");

    return this.adminRepository.updateUserRole(userId, role);
  }
}

