import type { Request, Response, NextFunction } from "express";
import type { GetCoursesUseCase } from "../useCase/GetCoursesUseCase";
import type { GetCourseUseCase } from "../useCase/GetCourseUseCase";
import type { CreateCourseUseCase } from "../useCase/CreateCourseUseCase";

export class CourseController {
  constructor(
    private readonly getCoursesUseCase: GetCoursesUseCase,
    private readonly getCourseUseCase: GetCourseUseCase,
    private readonly createCourseUseCase: CreateCourseUseCase,
  ) {}

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await this.getCoursesUseCase.execute();
      const formatted = courses.map((c) => c.toJSON());
      return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const course = await this.getCourseUseCase.execute(id);
      return res.status(200).json({ success: true, data: course.toJSON() });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await this.createCourseUseCase.execute(req.body);
      return res.status(201).json({ success: true, data: course.toJSON() });
    } catch (error) {
      next(error);
    }
  }
}
