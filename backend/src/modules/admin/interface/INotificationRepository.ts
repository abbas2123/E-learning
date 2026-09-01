export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: "system" | "approval" | "user" | "payment" | "discussion";
  userId?: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationParams {
  title: string;
  message: string;
  type?: "system" | "approval" | "user" | "payment" | "discussion";
  userId?: string | null;
  read?: boolean;
}

export interface INotificationRepository {
  createNotification(params: CreateNotificationParams): Promise<NotificationDto>;
  findByUserId(userId: string): Promise<NotificationDto[]>;
  markAsRead(id: string, userId?: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
}
