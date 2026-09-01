import { Router } from "express";
import { createDiscussionContainer } from "../composition/discussionContainer";
import { authMiddleware } from "../../auth/composition/auth.container";
import { instructorMiddleware } from "../../../middlewares/instructorMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";

const router = Router();
const { controller } = createDiscussionContainer();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC (still require auth so we know who is asking)
// ─────────────────────────────────────────────────────────────────────────────
router.use(authMiddleware);

// Search (course-scoped, ?courseId=&q=)
router.get("/discussions/search", (req, res, next) =>
  controller.searchDiscussions(req, res, next),
);

// Single discussion thread + replies
router.get("/discussions/:discussionId", (req, res, next) =>
  controller.getDiscussion(req, res, next),
);

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT — course-scoped Q&A
// ─────────────────────────────────────────────────────────────────────────────

// Create discussion (enrollment enforced inside use case)
router.post("/courses/:courseId/discussions", (req, res, next) =>
  controller.createDiscussion(req, res, next),
);

// List course discussions
router.get("/courses/:courseId/discussions", (req, res, next) =>
  controller.getCourseDiscussions(req, res, next),
);

// List lesson-specific discussions
router.get(
  "/courses/:courseId/lessons/:lessonId/discussions",
  (req, res, next) => controller.getLessonDiscussions(req, res, next),
);

// Edit/delete own discussion
router.put("/discussions/:discussionId", (req, res, next) =>
  controller.updateDiscussion(req, res, next),
);
router.delete("/discussions/:discussionId", (req, res, next) =>
  controller.deleteDiscussion(req, res, next),
);

// Replies (any authenticated user can reply; instructor ownership enforced inside use case)
router.post("/discussions/:discussionId/replies", (req, res, next) =>
  controller.createReply(req, res, next),
);
router.put("/discussions/:discussionId/replies/:replyId", (req, res, next) =>
  controller.updateReply(req, res, next),
);
router.delete("/discussions/:discussionId/replies/:replyId", (req, res, next) =>
  controller.deleteReply(req, res, next),
);

// Resolve (student/instructor/admin)
router.patch("/discussions/:discussionId/resolve", (req, res, next) =>
  controller.resolveDiscussion(req, res, next),
);

// Pin (instructor/admin only — enforced inside use case)
router.patch("/discussions/:discussionId/pin", (req, res, next) =>
  controller.pinDiscussion(req, res, next),
);

// Report
router.post("/discussions/:discussionId/report", (req, res, next) =>
  controller.reportDiscussion(req, res, next),
);
router.post(
  "/discussions/:discussionId/replies/:replyId/report",
  (req, res, next) => controller.reportReply(req, res, next),
);

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR — discussion inbox
// ─────────────────────────────────────────────────────────────────────────────
router.get("/instructor/discussions", instructorMiddleware, (req, res, next) =>
  controller.getInstructorDiscussions(req, res, next),
);

// Instructor resolve / pin (ownership enforced inside use cases)
router.patch(
  "/instructor/discussions/:discussionId/resolve",
  instructorMiddleware,
  (req, res, next) => controller.resolveDiscussion(req, res, next),
);
router.patch(
  "/instructor/discussions/:discussionId/pin",
  instructorMiddleware,
  (req, res, next) => controller.pinDiscussion(req, res, next),
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — moderation
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/discussions", adminMiddleware, (req, res, next) =>
  controller.getAllDiscussions(req, res, next),
);
router.get("/admin/discussions/reports", adminMiddleware, (req, res, next) =>
  controller.getDiscussionReports(req, res, next),
);
router.post("/admin/discussions/moderate", adminMiddleware, (req, res, next) =>
  controller.moderateDiscussion(req, res, next),
);

export default router;
