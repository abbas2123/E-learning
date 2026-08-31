import type { INotificationRepository } from "../../admin/interface/INotificationRepository";

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: string): Promise<number> {
    if (!userId) {
      throw new Error("User ID is required.");
    }
    return this.notificationRepository.markAllAsRead(userId);
  }
}
