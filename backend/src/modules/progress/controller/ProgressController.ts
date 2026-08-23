import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";
import type { MarkLessonCompleteUseCase } from "../useCase/MarkLessonCompleteUseCase";
import type { UpdateLessonWatchProgressUseCase } from "../useCase/UpdateLessonWatchProgressUseCase";
import type { GetLessonProgressUseCase } from "../useCase/GetLessonProgressUseCase";
import type { GetCourseProgressUseCase } from "../useCase/GetCourseProgressUseCase";

export class ProgressController {
  constructor(
    private readonly markLessonCompleteUseCase: MarkLessonCompleteUseCase,
    private readonly updateLessonWatchProgressUseCase: UpdateLessonWatchProgressUseCase,
    private readonly getLessonProgressUseCase: GetLessonProgressUseCase,
    private readonly getCourseProgressUseCase: GetCourseProgressUseCase,
  ) {}

  async markLessonComplete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const lessonId = String(req.params.lessonId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const watchedSeconds = req.body?.watchedSeconds;

      const progress = await this.markLessonCompleteUseCase.execute({
        userId,
        courseId,
        lessonId,
        watchedSeconds,
        userRole,
      });

      return res.status(200).json({
        success: true,
        data: {
          lessonId: progress.lessonId,
          completed: progress.completed,
          watchedSeconds: progress.watchedSeconds,
          completedAt: progress.completedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWatchProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const lessonId = String(req.params.lessonId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const watchedSeconds = Number(req.body?.watchedSeconds ?? 0);

      const progress = await this.updateLessonWatchProgressUseCase.execute({
        userId,
        courseId,
        lessonId,
        watchedSeconds,
        userRole,
      });

      return res.status(200).json({
        success: true,
        data: {
          lessonId: progress.lessonId,
          completed: progress.completed,
          watchedSeconds: progress.watchedSeconds,
          completedAt: progress.completedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getLessonProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const lessonId = String(req.params.lessonId);
      const userId = req.userId!;
      const userRole = req.userRole;

      const progress = await this.getLessonProgressUseCase.execute({
        userId,
        courseId,
        lessonId,
        userRole,
      });

      return res.status(200).json({
        success: true,
        data: {
          lessonId: progress.lessonId,
          completed: progress.completed,
          watchedSeconds: progress.watchedSeconds,
          completedAt: progress.completedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCourseProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const userId = req.userId!;
      const userRole = req.userRole;

      const summary = await this.getCourseProgressUseCase.execute({
        userId,
        courseId,
        userRole,
      });

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
