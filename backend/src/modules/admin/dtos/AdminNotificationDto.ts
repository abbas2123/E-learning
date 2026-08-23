export type AdminNotificationDto = {
  id: string;
  title: string;
  message: string;
  type: "system" | "approval" | "user" | "payment";
  read: boolean;
  createdAt?: string | Date;
};
