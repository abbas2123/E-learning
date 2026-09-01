import { Router } from "express";
import { createInstructorContainer } from "../composition/instructorContainer";
import { authMiddleware } from "../../auth/composition/auth.container";
import { instructorMiddleware } from "../../../middlewares/instructorMiddleware";
import { uploadVideo } from "../../../middlewares/uploadMiddleware";
import { mediaUploadLimiter } from "../../../middlewares/rateLimiter";

const router = Router();
const { controller } = createInstructorContainer();

// Apply route for students (requires auth, but not instructor role yet)
router.post("/apply", authMiddleware, (req, res, next) =>
  controller.applyInstructor(req, res, next),
);

// Studio routes require authentication AND instructor/admin privileges
router.use(authMiddleware);
router.use(instructorMiddleware);

// Video Upload Route (Multer memoryStorage + Cloudinary video stream, 150MB limit)
router.post(
  "/upload-video",
  mediaUploadLimiter,
  uploadVideo.single("video"),
  (req, res, next) => controller.uploadVideo(req, res, next),
);

router.get("/dashboard", (req, res, next) =>
  controller.getDashboardStats(req, res, next),
);
router.get("/courses", (req, res, next) =>
  controller.getCourses(req, res, next),
);
router.post("/courses", (req, res, next) =>
  controller.createCourse(req, res, next),
);
router.get("/courses/:courseId", (req, res, next) =>
  controller.getCourseById(req, res, next),
);
router.put("/courses/:courseId", (req, res, next) =>
  controller.updateCourse(req, res, next),
);
router.post("/courses/:courseId/submit", (req, res, next) =>
  controller.submitCourseForApproval(req, res, next),
);

router.get("/students", (req, res, next) =>
  controller.getStudents(req, res, next),
);
router.get("/revenue", (req, res, next) =>
  controller.getRevenue(req, res, next),
);
router.get("/analytics", (req, res, next) =>
  controller.getAnalytics(req, res, next),
);

export default router;
