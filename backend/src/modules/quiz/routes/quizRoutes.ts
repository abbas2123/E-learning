import { Router } from "express";
import { createQuizContainer } from "../composition/quizContainer";
import { authMiddleware } from "../../auth/composition/auth.container";

const router = Router();
const { controller } = createQuizContainer();

// Quiz Management Routes
router.post("/courses/:courseId/quizzes", authMiddleware, (req, res, next) =>
  controller.createQuiz(req, res, next),
);

router.get("/courses/:courseId/quizzes", authMiddleware, (req, res, next) =>
  controller.getCourseQuizzes(req, res, next),
);

router.get("/quizzes/:quizId", authMiddleware, (req, res, next) =>
  controller.getQuiz(req, res, next),
);

router.put("/quizzes/:quizId", authMiddleware, (req, res, next) =>
  controller.updateQuiz(req, res, next),
);

router.delete("/quizzes/:quizId", authMiddleware, (req, res, next) =>
  controller.deleteQuiz(req, res, next),
);

// Question Management Routes
router.post("/quizzes/:quizId/questions", authMiddleware, (req, res, next) =>
  controller.createQuestion(req, res, next),
);

router.put("/questions/:questionId", authMiddleware, (req, res, next) =>
  controller.updateQuestion(req, res, next),
);

router.delete("/questions/:questionId", authMiddleware, (req, res, next) =>
  controller.deleteQuestion(req, res, next),
);

router.patch(
  "/quizzes/:quizId/questions/reorder",
  authMiddleware,
  (req, res, next) => controller.reorderQuestions(req, res, next),
);

// Attempt & Auto-Grading Routes
router.post("/quizzes/:quizId/start", authMiddleware, (req, res, next) =>
  controller.startAttempt(req, res, next),
);

router.post(
  "/quiz-attempts/:attemptId/submit",
  authMiddleware,
  (req, res, next) => controller.submitAttempt(req, res, next),
);

router.get("/quizzes/:quizId/attempts", authMiddleware, (req, res, next) =>
  controller.getAttempts(req, res, next),
);

router.get("/quiz-attempts/:attemptId", authMiddleware, (req, res, next) =>
  controller.getAttemptResult(req, res, next),
);

export default router;
