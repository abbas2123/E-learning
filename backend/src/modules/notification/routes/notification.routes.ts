import { Router } from "express";
import { createNotificationContainer } from "../composition/notification.container";
import { authMiddleware } from "../../auth/composition/auth.container";

const router = Router();
const { controller } = createNotificationContainer();

router.use(authMiddleware as any);

router.get("/", (req, res, next) =>
  controller.getNotifications(req, res, next),
);
router.patch("/read-all", (req, res, next) =>
  controller.markAllAsRead(req, res, next),
);
router.patch("/:id/read", (req, res, next) =>
  controller.markAsRead(req, res, next),
);

export default router;
