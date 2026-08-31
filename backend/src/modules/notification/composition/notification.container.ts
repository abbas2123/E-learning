import { NotificationRepository } from "../../admin/Repository/repository/NotificationRepository";
import { GetUserNotificationsUseCase } from "../useCase/GetUserNotificationsUseCase";
import { MarkNotificationReadUseCase } from "../useCase/MarkNotificationReadUseCase";
import { MarkAllNotificationsReadUseCase } from "../useCase/MarkAllNotificationsReadUseCase";
import { NotificationController } from "../controller/NotificationController";

export function createNotificationContainer() {
  const notificationRepository = new NotificationRepository();

  const getUserNotificationsUseCase = new GetUserNotificationsUseCase(notificationRepository);
  const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);
  const markAllNotificationsReadUseCase = new MarkAllNotificationsReadUseCase(notificationRepository);

  const controller = new NotificationController(
    getUserNotificationsUseCase,
    markNotificationReadUseCase,
    markAllNotificationsReadUseCase,
  );

  return { controller };
}
