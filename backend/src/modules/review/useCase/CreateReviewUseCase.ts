import type { IReviewRepository, ReviewDto } from "../interface/IReviewRepository";
import { UserModel } from "../../auth/Repository/database/User";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";

export interface CreateReviewInput {
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
}

export class CreateReviewUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: CreateReviewInput): Promise<ReviewDto> {
    const { userId, courseId, rating, comment } = input;

    if (!userId) throw new Error("Authenticated user required.");
    if (!courseId) throw new Error("Course ID required.");
    if (!rating || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");
    if (!comment || comment.trim().length === 0) throw new Error("Review comment cannot be empty.");

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    if (!user) throw new Error("User not found.");

    // Check enrollment rule — only enrolled students can leave reviews
    const studentId = user.id || userId;
    const isEnrolled = await EnrollmentModel.findOne({
      studentId,
      courseId,
      status: "completed",
    });

    if (!isEnrolled) {
      throw new Error("Only enrolled students can review this course.");
    }

    // Prevent duplicate reviews
    const existing = await this.reviewRepository.getUserReviewForCourse(studentId, courseId);
    if (existing) {
      throw new Error("You have already reviewed this course.");
    }

    return this.reviewRepository.createReview({
      courseId,
      studentId,
      studentName: user.name,
      studentAvatar: user.avatar || undefined,
      rating,
      comment: comment.trim(),
    });
  }
}
