import { Router } from "express";
import { createInstructorContainer } from "../composition/instructorContainer";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { instructorMiddleware } from "../../../middlewares/instructorMiddleware";

const router = Router();
const { controller } = createInstructorContainer();

// All instructor routes require authentication AND instructor/admin privileges
router.use(authMiddleware);
router.use(instructorMiddleware);

router.get("/dashboard", (req, res, next) => controller.getDashboardStats(req, res, next));
router.get("/courses", (req, res, next) => controller.getCourses(req, res, next));
router.post("/courses", (req, res, next) => controller.createCourse(req, res, next));
router.get("/courses/:courseId", (req, res, next) => controller.getCourseById(req, res, next));
router.put("/courses/:courseId", (req, res, next) => controller.updateCourse(req, res, next));
router.post("/courses/:courseId/submit", (req, res, next) => controller.submitCourseForApproval(req, res, next));

router.get("/students", (req, res, next) => controller.getStudents(req, res, next));
router.get("/revenue", (req, res, next) => controller.getRevenue(req, res, next));
router.get("/analytics", (req, res, next) => controller.getAnalytics(req, res, next));

export default router;
