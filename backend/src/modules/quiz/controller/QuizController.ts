import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";

import type { CreateQuizUseCase } from "../useCase/CreateQuizUseCase";
import type { UpdateQuizUseCase } from "../useCase/UpdateQuizUseCase";
import type { DeleteQuizUseCase } from "../useCase/DeleteQuizUseCase";
import type { GetQuizUseCase } from "../useCase/GetQuizUseCase";
import type { GetCourseQuizzesUseCase } from "../useCase/GetCourseQuizzesUseCase";

import type { CreateQuestionUseCase } from "../useCase/CreateQuestionUseCase";
import type { UpdateQuestionUseCase } from "../useCase/UpdateQuestionUseCase";
import type { DeleteQuestionUseCase } from "../useCase/DeleteQuestionUseCase";
import type { ReorderQuestionsUseCase } from "../useCase/ReorderQuestionsUseCase";

import type { StartQuizAttemptUseCase } from "../useCase/StartQuizAttemptUseCase";
import type { SubmitQuizAttemptUseCase } from "../useCase/SubmitQuizAttemptUseCase";
import type { GetQuizAttemptsUseCase } from "../useCase/GetQuizAttemptsUseCase";
import type { GetQuizResultUseCase } from "../useCase/GetQuizResultUseCase";

export class QuizController {
  constructor(
    private readonly createQuizUseCase: CreateQuizUseCase,
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
    private readonly getQuizUseCase: GetQuizUseCase,
    private readonly getCourseQuizzesUseCase: GetCourseQuizzesUseCase,

    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
    private readonly reorderQuestionsUseCase: ReorderQuestionsUseCase,

    private readonly startQuizAttemptUseCase: StartQuizAttemptUseCase,
    private readonly submitQuizAttemptUseCase: SubmitQuizAttemptUseCase,
    private readonly getQuizAttemptsUseCase: GetQuizAttemptsUseCase,
    private readonly getQuizResultUseCase: GetQuizResultUseCase,
  ) {}

  // Quiz Endpoints
  async createQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const quiz = await this.createQuizUseCase.execute({
        ...req.body,
        courseId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(201).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async updateQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quizId = String(req.params.quizId);
      const quiz = await this.updateQuizUseCase.execute({
        ...req.body,
        quizId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quizId = String(req.params.quizId);
      await this.deleteQuizUseCase.execute({
        quizId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, message: "Quiz deleted successfully." });
    } catch (error) {
      next(error);
    }
  }

  async getQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quizId = String(req.params.quizId);
      const data = await this.getQuizUseCase.execute({
        quizId,
        userId: req.userId,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCourseQuizzes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const quizzes = await this.getCourseQuizzesUseCase.execute({
        courseId,
        userId: req.userId,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
      next(error);
    }
  }

  // Question Endpoints
  async createQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quizId = String(req.params.quizId);
      const question = await this.createQuestionUseCase.execute({
        ...req.body,
        quizId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(201).json({ success: true, data: question });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const questionId = String(req.params.questionId);
      const question = await this.updateQuestionUseCase.execute({
        ...req.body,
        questionId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data: question });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const questionId = String(req.params.questionId);
      await this.deleteQuestionUseCase.execute({
        questionId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, message: "Question deleted successfully." });
    } catch (error) {
      next(error);
    }
  }

  async reorderQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quizId = String(req.params.quizId);
      const { orderedQuestionIds } = req.body;
      const questions = await this.reorderQuestionsUseCase.execute({
        quizId,
        orderedQuestionIds,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  }

  // Attempt & Grading Endpoints
  async startAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quizId = String(req.params.quizId);
      const result = await this.startQuizAttemptUseCase.execute({
        quizId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const attemptId = String(req.params.attemptId);
      const { answers } = req.body;
      const result = await this.submitQuizAttemptUseCase.execute({
        attemptId,
        answers,
        userId: req.userId!,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAttempts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const quizId = String(req.params.quizId);
      const attempts = await this.getQuizAttemptsUseCase.execute({
        quizId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data: attempts });
    } catch (error) {
      next(error);
    }
  }

  async getAttemptResult(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const attemptId = String(req.params.attemptId);
      const result = await this.getQuizResultUseCase.execute({
        attemptId,
        userId: req.userId!,
        userRole: req.userRole,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
