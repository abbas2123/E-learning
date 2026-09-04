import type { IReviewRepository, ReviewDto } from "../interface/IReviewRepository";
import { ValidationError } from "../../../core/errors/AppError";

export interface CourseReviewsResult {
  reviews: ReviewDto[];
  averageRating: number;
  totalReviews: number;
}

export class GetCourseReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(courseId: string): Promise<CourseReviewsResult> {
    if (!courseId) throw new ValidationError("Course ID is required.");

    const reviews = await this.reviewRepository.findByCourseId(courseId);
    const { average, count } = await this.reviewRepository.getAverageRatingForCourse(courseId);

    return {
      reviews,
      averageRating: average,
      totalReviews: count,
    };
  }
}
