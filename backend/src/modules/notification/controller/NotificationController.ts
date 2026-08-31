import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";
import type { GetUserNotificationsUseCase } from "../useCase/GetUserNotificationsUseCase";
import type { MarkNotificationReadUseCase } from "../useCase/MarkNotificationReadUseCase";
import type { MarkAllNotificationsReadUseCase } from "../useCase/MarkAllNotificationsReadUseCase";

export class NotificationController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const result = await this.getUserNotificationsUseCase.execute(userId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const notificationId = String(req.params.id);
      const success = await this.markNotificationReadUseCase.execute(notificationId, userId);
      return res.status(200).json({ success, message: "Notification marked as read." });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const count = await this.markAllNotificationsReadUseCase.execute(userId);
      return res.status(200).json({
        success: true,
        data: { modifiedCount: count },
        message: "All notifications marked as read.",
      });
    } catch (error) {
      next(error);
    }
  }
}
