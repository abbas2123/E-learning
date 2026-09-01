import { Router } from "express";
import { dashboardController } from "../composition/dashboard.container";
import { authMiddleware } from "../../auth/composition/auth.container";

const router = Router();

router.get(
  "/summary",
  authMiddleware,
  dashboardController.getSummary.bind(dashboardController),
);
router.get(
  "/active-courses",
  authMiddleware,
  dashboardController.getActiveCourses.bind(dashboardController),
);
router.get(
  "/courses",
  dashboardController.getCourses.bind(dashboardController),
);
router.post(
  "/enroll/:courseId",
  authMiddleware,
  dashboardController.enrollCourse.bind(dashboardController),
);

export default router;
