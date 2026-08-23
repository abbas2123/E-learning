import type { IAdminRepository } from "../interface/IAdminRepository";

export class MarkNotificationsReadUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<void> {
    await this.adminRepository.markNotificationsRead();
  }
}
