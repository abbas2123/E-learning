import type { Request, Response, NextFunction } from "express";
import type { CreateReviewUseCase } from "../useCase/CreateReviewUseCase";
import type { GetCourseReviewsUseCase } from "../useCase/GetCourseReviewsUseCase";

export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getCourseReviewsUseCase: GetCourseReviewsUseCase,
  ) {}

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { courseId, rating, comment } = req.body;

      const review = await this.createReviewUseCase.execute({
        userId,
        courseId,
        rating: Number(rating),
        comment,
      });

      return res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      next(error);
    }
  }

  async getCourseReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const result = await this.getCourseReviewsUseCase.execute(courseId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }
}
