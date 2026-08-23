import { ReviewRepository } from "../repository/ReviewRepository";
import { CreateReviewUseCase } from "../useCase/CreateReviewUseCase";
import { GetCourseReviewsUseCase } from "../useCase/GetCourseReviewsUseCase";
import { ReviewController } from "../controller/ReviewController";

const reviewRepository = new ReviewRepository();

const createReviewUseCase = new CreateReviewUseCase(reviewRepository);
const getCourseReviewsUseCase = new GetCourseReviewsUseCase(reviewRepository);

export const reviewController = new ReviewController(
  createReviewUseCase,
  getCourseReviewsUseCase,
);
