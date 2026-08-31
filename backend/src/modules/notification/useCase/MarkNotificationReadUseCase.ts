import type { INotificationRepository } from "../../admin/interface/INotificationRepository";

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(notificationId: string, userId: string): Promise<boolean> {
    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }
    return this.notificationRepository.markAsRead(notificationId, userId);
  }
}
