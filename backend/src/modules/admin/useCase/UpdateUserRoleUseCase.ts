import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminUserDto } from "../dtos/AdminUserDto";

export class UpdateUserRoleUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(userId: string, role: string): Promise<AdminUserDto> {
    if (!userId) throw new Error("User ID is required.");
    if (!role) throw new Error("Role is required.");

    return this.adminRepository.updateUserRole(userId, role);
  }
}
