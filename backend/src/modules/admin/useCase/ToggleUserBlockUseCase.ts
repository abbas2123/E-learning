import type { IAdminRepository } from "../interface/IAdminRepository";

export class ToggleUserBlockUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(userId: string): Promise<string> {
    if (!userId) {
      throw new Error("User ID is required.");
    }
    return this.adminRepository.toggleUserBlock(userId);
  }
}
