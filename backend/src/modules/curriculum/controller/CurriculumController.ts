import type { Request, Response, NextFunction } from "express";
import type { CreateSectionUseCase } from "../useCase/CreateSectionUseCase";
import type { UpdateSectionUseCase } from "../useCase/UpdateSectionUseCase";
import type { DeleteSectionUseCase } from "../useCase/DeleteSectionUseCase";
import type { CreateLessonUseCase } from "../useCase/CreateLessonUseCase";
import type { UpdateLessonUseCase } from "../useCase/UpdateLessonUseCase";
import type { DeleteLessonUseCase } from "../useCase/DeleteLessonUseCase";
import type { GetCourseCurriculumUseCase } from "../useCase/GetCourseCurriculumUseCase";
import type { ReorderSectionsUseCase } from "../useCase/ReorderSectionsUseCase";
import type { ReorderLessonsUseCase } from "../useCase/ReorderLessonsUseCase";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";

export class CurriculumController {
  constructor(
    private readonly createSectionUseCase: CreateSectionUseCase,
    private readonly updateSectionUseCase: UpdateSectionUseCase,
    private readonly deleteSectionUseCase: DeleteSectionUseCase,
    private readonly createLessonUseCase: CreateLessonUseCase,
    private readonly updateLessonUseCase: UpdateLessonUseCase,
    private readonly deleteLessonUseCase: DeleteLessonUseCase,
    private readonly getCourseCurriculumUseCase: GetCourseCurriculumUseCase,
    private readonly reorderSectionsUseCase: ReorderSectionsUseCase,
    private readonly reorderLessonsUseCase: ReorderLessonsUseCase,
  ) {}

  async getCourseCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const curriculum = await this.getCourseCurriculumUseCase.execute(courseId);
      return res.status(200).json({ success: true, data: curriculum });
    } catch (error) {
      next(error);
    }
  }

  async createSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const { title, description, order } = req.body;

      const section = await this.createSectionUseCase.execute({
        courseId,
        title,
        description,
        order,
        userId,
        userRole,
      });

      return res.status(201).json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  }

  async updateSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sectionId = String(req.params.sectionId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const { title, description, order } = req.body;

      const section = await this.updateSectionUseCase.execute({
        sectionId,
        title,
        description,
        order,
        userId,
        userRole,
      });

      return res.status(200).json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  }

  async deleteSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sectionId = String(req.params.sectionId);
      const userId = req.userId!;
      const userRole = req.userRole;

      await this.deleteSectionUseCase.execute({
        sectionId,
        userId,
        userRole,
      });

      return res.status(200).json({ success: true, message: "Section deleted successfully." });
    } catch (error) {
      next(error);
    }
  }

  async reorderSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const { orderedSectionIds } = req.body;

      const sections = await this.reorderSectionsUseCase.execute({
        courseId,
        orderedSectionIds,
        userId,
        userRole,
      });

      return res.status(200).json({ success: true, data: sections });
    } catch (error) {
      next(error);
    }
  }

  async createLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sectionId = String(req.params.sectionId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const { title, description, type, videoUrl, duration, order, isPreview } = req.body;

      const lesson = await this.createLessonUseCase.execute({
        sectionId,
        title,
        description,
        type,
        videoUrl,
        duration,
        order,
        isPreview,
        userId,
        userRole,
      });

      return res.status(201).json({ success: true, data: lesson });
    } catch (error) {
      next(error);
    }
  }

  async updateLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lessonId = String(req.params.lessonId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const { title, description, type, videoUrl, duration, order, isPreview, resources } = req.body;

      const lesson = await this.updateLessonUseCase.execute({
        lessonId,
        title,
        description,
        type,
        videoUrl,
        duration,
        order,
        isPreview,
        resources,
        userId,
        userRole,
      });

      return res.status(200).json({ success: true, data: lesson });
    } catch (error) {
      next(error);
    }
  }

  async deleteLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lessonId = String(req.params.lessonId);
      const userId = req.userId!;
      const userRole = req.userRole;

      await this.deleteLessonUseCase.execute({
        lessonId,
        userId,
        userRole,
      });

      return res.status(200).json({ success: true, message: "Lesson deleted successfully." });
    } catch (error) {
      next(error);
    }
  }

  async reorderLessons(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sectionId = String(req.params.sectionId);
      const userId = req.userId!;
      const userRole = req.userRole;
      const { orderedLessonIds } = req.body;

      const lessons = await this.reorderLessonsUseCase.execute({
        sectionId,
        orderedLessonIds,
        userId,
        userRole,
      });

      return res.status(200).json({ success: true, data: lessons });
    } catch (error) {
      next(error);
    }
  }
}
