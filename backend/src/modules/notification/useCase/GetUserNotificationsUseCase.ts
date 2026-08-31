import type { INotificationRepository, NotificationDto } from "../../admin/interface/INotificationRepository";

export interface UserNotificationsResult {
  notifications: NotificationDto[];
  unreadCount: number;
}

export class GetUserNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: string): Promise<UserNotificationsResult> {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepository.findByUserId(userId),
      this.notificationRepository.getUnreadCount(userId),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }
}
