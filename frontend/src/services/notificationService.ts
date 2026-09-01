import apiClient from "./apiClient";

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: "system" | "approval" | "user" | "payment" | "discussion";
  userId?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotificationsResponse {
  notifications: UserNotification[];
  unreadCount: number;
}

export const notificationService = {
  async getNotifications(): Promise<UserNotificationsResponse> {
    const res = await apiClient.get<{ success: boolean; data: UserNotificationsResponse }>("/api/notifications");
    return res.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/api/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/api/notifications/read-all");
  },
};
