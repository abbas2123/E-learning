import { Router } from "express";
import { courseController } from "../composition/course.container";
import { dashboardController } from "../../dashboard/composition/dashboard.container";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", courseController.getCourses.bind(courseController));
router.get("/:id", courseController.getCourseById.bind(courseController));
router.post("/", courseController.createCourse.bind(courseController));
router.post(
  "/:courseId/enroll",
  authMiddleware,
  dashboardController.enrollCourse.bind(dashboardController),
);

export default router;
