import { Router } from "express";
import { createCurriculumContainer } from "../composition/curriculumContainer";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { optionalAuthMiddleware } from "../../../middlewares/optionalAuthMiddleware";

const router = Router();
const { controller } = createCurriculumContainer();

// 1. GET /api/courses/:courseId/curriculum (Public / Student Read — optional auth for access level)
router.get(
  "/courses/:courseId/curriculum",
  optionalAuthMiddleware,
  (req, res, next) => controller.getCourseCurriculum(req, res, next),
);

// 2. POST /api/courses/:courseId/sections (Auth required)
router.post(
  "/courses/:courseId/sections",
  authMiddleware,
  (req, res, next) => controller.createSection(req, res, next),
);

// 3. PUT /api/sections/:sectionId (Auth required)
router.put(
  "/sections/:sectionId",
  authMiddleware,
  (req, res, next) => controller.updateSection(req, res, next),
);

// 4. DELETE /api/sections/:sectionId (Auth required)
router.delete(
  "/sections/:sectionId",
  authMiddleware,
  (req, res, next) => controller.deleteSection(req, res, next),
);

// 5. PATCH /api/courses/:courseId/sections/reorder (Auth required)
router.patch(
  "/courses/:courseId/sections/reorder",
  authMiddleware,
  (req, res, next) => controller.reorderSections(req, res, next),
);

// 6. POST /api/sections/:sectionId/lessons (Auth required)
router.post(
  "/sections/:sectionId/lessons",
  authMiddleware,
  (req, res, next) => controller.createLesson(req, res, next),
);

// 7. PUT /api/lessons/:lessonId (Auth required)
router.put(
  "/lessons/:lessonId",
  authMiddleware,
  (req, res, next) => controller.updateLesson(req, res, next),
);

// 8. DELETE /api/lessons/:lessonId (Auth required)
router.delete(
  "/lessons/:lessonId",
  authMiddleware,
  (req, res, next) => controller.deleteLesson(req, res, next),
);

// 9. PATCH /api/sections/:sectionId/lessons/reorder (Auth required)
router.patch(
  "/sections/:sectionId/lessons/reorder",
  authMiddleware,
  (req, res, next) => controller.reorderLessons(req, res, next),
);

export default router;
