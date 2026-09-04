import type { IAdminRepository } from "../interface/IAdminRepository";
import { ForbiddenError, ValidationError } from "../../../core/errors/AppError";

export class ToggleUserBlockUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(userId: string, requesterId?: string): Promise<string> {
    if (!userId) {
      throw new ValidationError("User ID is required.");
    }
    if (userId === requesterId) {
      throw new ForbiddenError(
        "Administrators cannot block their own account.",
      );
    }
    return this.adminRepository.toggleUserBlock(userId);
  }
}
