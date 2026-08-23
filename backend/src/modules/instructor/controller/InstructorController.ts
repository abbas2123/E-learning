import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";

import type { GetInstructorDashboardUseCase } from "../useCase/GetInstructorDashboardUseCase";
import type { GetInstructorCoursesUseCase } from "../useCase/GetInstructorCoursesUseCase";
import type { GetInstructorCourseUseCase } from "../useCase/GetInstructorCourseUseCase";
import type { CreateInstructorCourseUseCase } from "../useCase/CreateInstructorCourseUseCase";
import type { UpdateInstructorCourseUseCase } from "../useCase/UpdateInstructorCourseUseCase";
import type { SubmitCourseForApprovalUseCase } from "../useCase/SubmitCourseForApprovalUseCase";
import type { GetInstructorStudentsUseCase } from "../useCase/GetInstructorStudentsUseCase";
import type { GetInstructorRevenueUseCase } from "../useCase/GetInstructorRevenueUseCase";
import type { GetInstructorAnalyticsUseCase } from "../useCase/GetInstructorAnalyticsUseCase";

export class InstructorController {
  constructor(
    private readonly getInstructorDashboardUseCase: GetInstructorDashboardUseCase,
    private readonly getInstructorCoursesUseCase: GetInstructorCoursesUseCase,
    private readonly getInstructorCourseUseCase: GetInstructorCourseUseCase,
    private readonly createInstructorCourseUseCase: CreateInstructorCourseUseCase,
    private readonly updateInstructorCourseUseCase: UpdateInstructorCourseUseCase,
    private readonly submitCourseForApprovalUseCase: SubmitCourseForApprovalUseCase,
    private readonly getInstructorStudentsUseCase: GetInstructorStudentsUseCase,
    private readonly getInstructorRevenueUseCase: GetInstructorRevenueUseCase,
    private readonly getInstructorAnalyticsUseCase: GetInstructorAnalyticsUseCase,
  ) {}

  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await this.getInstructorDashboardUseCase.execute(req.userId!);
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const courses = await this.getInstructorCoursesUseCase.execute(req.userId!, status);
      return res.status(200).json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const course = await this.getInstructorCourseUseCase.execute(
        courseId,
        req.userId!,
        req.userRole,
      );
      return res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const course = await this.createInstructorCourseUseCase.execute(req.userId!, req.body);
      return res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const course = await this.updateInstructorCourseUseCase.execute(
        courseId,
        req.userId!,
        req.body,
      );
      return res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async submitCourseForApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const result = await this.submitCourseForApprovalUseCase.execute(courseId, req.userId!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;

      const result = await this.getInstructorStudentsUseCase.execute(
        req.userId!,
        page,
        limit,
        search,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getRevenue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const revenue = await this.getInstructorRevenueUseCase.execute(req.userId!);
      return res.status(200).json({ success: true, data: revenue });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await this.getInstructorAnalyticsUseCase.execute(req.userId!);
      return res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }
}
