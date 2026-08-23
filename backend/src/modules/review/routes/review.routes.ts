import { Router } from "express";
import { reviewController } from "../composition/review.container";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  reviewController.createReview.bind(reviewController),
);

router.get(
  "/course/:courseId",
  reviewController.getCourseReviews.bind(reviewController),
);

export default router;
