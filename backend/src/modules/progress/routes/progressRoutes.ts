import { Router } from "express";
import { createProgressContainer } from "../composition/progressContainer";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const router = Router();
const { controller } = createProgressContainer();

// 1. POST /api/courses/:courseId/lessons/:lessonId/complete
router.post(
  "/courses/:courseId/lessons/:lessonId/complete",
  authMiddleware,
  (req, res, next) => controller.markLessonComplete(req, res, next),
);

// 2. PATCH /api/courses/:courseId/lessons/:lessonId/progress
router.patch(
  "/courses/:courseId/lessons/:lessonId/progress",
  authMiddleware,
  (req, res, next) => controller.updateWatchProgress(req, res, next),
);

// 3. GET /api/courses/:courseId/lessons/:lessonId/progress
router.get(
  "/courses/:courseId/lessons/:lessonId/progress",
  authMiddleware,
  (req, res, next) => controller.getLessonProgress(req, res, next),
);

// 4. GET /api/courses/:courseId/progress
router.get(
  "/courses/:courseId/progress",
  authMiddleware,
  (req, res, next) => controller.getCourseProgress(req, res, next),
);

export default router;
