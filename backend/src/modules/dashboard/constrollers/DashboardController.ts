import type { Request, Response, NextFunction } from "express";
import type { GetDashboardSummaryUseCase } from "../useCase/getDashboardSummaryUseCase";
import type { GetUserActiveCoursesUseCase } from "../useCase/getUserActiveCoursesUseCase";
import type { GetCoursesCatalogUseCase } from "../useCase/getCoursesCatalogUseCase";

export class DashboardController {
  constructor(
    private readonly getSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getActiveCoursesUseCase: GetUserActiveCoursesUseCase,
    private readonly getCatalogUseCase: GetCoursesCatalogUseCase,
  ) {}

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const summary = await this.getSummaryUseCase.execute(userId);
      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const courses = await this.getActiveCoursesUseCase.execute(userId);
      return res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await this.getCatalogUseCase.execute();
      return res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }
}
