import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminStatsDto } from "../dtos/AdminStatsDto";

export class GetAdminStatsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminStatsDto> {
    return this.adminRepository.getStats();
  }
}
