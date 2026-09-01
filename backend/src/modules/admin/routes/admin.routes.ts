import { Router } from "express";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { adminController } from "../composition/admin.container";

const router = Router();

// Apply auth + admin guard to all admin routes
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

// ─── Stats & Dashboard ───────────────────────────────────────────────────────
router.get("/stats", adminController.getStats.bind(adminController));

// ─── Users Management ────────────────────────────────────────────────────────
router.get("/users", adminController.getUsers.bind(adminController));
router.patch("/users/:id/block", adminController.toggleUserBlock.bind(adminController));
router.patch("/users/:id/role", adminController.updateUserRole.bind(adminController));
router.post("/users", adminController.createUser.bind(adminController));

// ─── Courses Management ──────────────────────────────────────────────────────
router.get("/courses", adminController.getCourses.bind(adminController));
router.get("/courses/pending", adminController.getPendingCourses.bind(adminController));
router.post("/courses", adminController.createCourse.bind(adminController));
router.post("/courses/:id/approve", adminController.approveCourse.bind(adminController));
router.post("/courses/:id/reject", adminController.rejectCourse.bind(adminController));
router.delete("/courses/:id", adminController.deleteCourse.bind(adminController));

// ─── Categories Management ───────────────────────────────────────────────────
router.get("/categories", adminController.getCategories.bind(adminController));
router.post("/categories", adminController.createCategory.bind(adminController));
router.delete("/categories/:id", adminController.deleteCategory.bind(adminController));

// ─── Enrollments ─────────────────────────────────────────────────────────────
router.get("/enrollments", adminController.getEnrollments.bind(adminController));

// ─── Notifications ────────────────────────────────────────────────────────────
router.get("/notifications", adminController.getNotifications.bind(adminController));
router.patch("/notifications/read", adminController.markNotificationsRead.bind(adminController));

export default router;
