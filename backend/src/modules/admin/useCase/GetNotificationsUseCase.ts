import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminNotificationDto } from "../dtos/AdminNotificationDto";

export class GetNotificationsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminNotificationDto[]> {
    return this.adminRepository.getNotifications();
  }
}
