import type { Request, Response, NextFunction } from "express";
import type { GetAdminStatsUseCase } from "../useCase/GetAdminStatsUseCase";
import type { GetUsersUseCase } from "../useCase/GetUsersUseCase";
import type { ToggleUserBlockUseCase } from "../useCase/ToggleUserBlockUseCase";
import type { CreateUserUseCase } from "../useCase/CreateUserUseCase";
import type { CreateCourseUseCase } from "../useCase/CreateCourseUseCase";
import type { GetCoursesUseCase } from "../useCase/GetCoursesUseCase";
import type { GetPendingCoursesUseCase } from "../useCase/GetPendingCoursesUseCase";
import type { ApproveCourseUseCase } from "../useCase/ApproveCourseUseCase";
import type { RejectCourseUseCase } from "../useCase/RejectCourseUseCase";
import type { DeleteCourseUseCase } from "../useCase/DeleteCourseUseCase";
import type { GetCategoriesUseCase } from "../useCase/GetCategoriesUseCase";
import type { CreateCategoryUseCase } from "../useCase/CreateCategoryUseCase";
import type { DeleteCategoryUseCase } from "../useCase/DeleteCategoryUseCase";
import type { GetEnrollmentsUseCase } from "../useCase/GetEnrollmentsUseCase";
import type { GetNotificationsUseCase } from "../useCase/GetNotificationsUseCase";
import type { MarkNotificationsReadUseCase } from "../useCase/MarkNotificationsReadUseCase";

export class AdminController {
  constructor(
    private readonly getAdminStatsUseCase: GetAdminStatsUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly toggleUserBlockUseCase: ToggleUserBlockUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getCoursesUseCase: GetCoursesUseCase,
    private readonly getPendingCoursesUseCase: GetPendingCoursesUseCase,
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly approveCourseUseCase: ApproveCourseUseCase,
    private readonly rejectCourseUseCase: RejectCourseUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly getEnrollmentsUseCase: GetEnrollmentsUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationsReadUseCase: MarkNotificationsReadUseCase,
  ) {}

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.getAdminStatsUseCase.execute();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.getUsersUseCase.execute();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const status = await this.toggleUserBlockUseCase.execute(id);
      return res.status(200).json({ success: true, status });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role } = req.body;
      const data = await this.createUserUseCase.execute({ name, email, role });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.getCoursesUseCase.execute();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getPendingCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.getPendingCoursesUseCase.execute();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, category, description, price, level, thumbnail, status } = req.body;
      const data = await this.createCourseUseCase.execute({
        title,
        category,
        description,
        price,
        level,
        thumbnail,
        status,
      });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async approveCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await this.approveCourseUseCase.execute(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async rejectCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { reason } = req.body;
      const data = await this.rejectCourseUseCase.execute(id, reason ?? "");
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await this.deleteCourseUseCase.execute(id);
      return res.status(200).json({ success: true, message: "Course deleted." });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.getCategoriesUseCase.execute();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug } = req.body;
      const data = await this.createCategoryUseCase.execute({ name, slug });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await this.deleteCategoryUseCase.execute(id);
      return res.status(200).json({ success: true, message: "Category deleted." });
    } catch (error) {
      next(error);
    }
  }

  async getEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.getEnrollmentsUseCase.execute();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.getNotificationsUseCase.execute();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await this.markNotificationsReadUseCase.execute();
      return res.status(200).json({ success: true, message: "Notifications marked as read." });
    } catch (error) {
      next(error);
    }
  }
}
