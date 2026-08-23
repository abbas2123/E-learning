import { randomUUID } from "crypto";
import { ReviewModel } from "../database/Review";
import type {
  IReviewRepository,
  ReviewDto,
  CreateReviewParams,
} from "../interface/IReviewRepository";

export class ReviewRepository implements IReviewRepository {
  private toDto(doc: any): ReviewDto {
    return {
      id: doc.id ?? doc._id.toString(),
      courseId: doc.courseId,
      studentId: doc.studentId,
      studentName: doc.studentName,
      studentAvatar: doc.studentAvatar ?? undefined,
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
    };
  }

  async createReview(params: CreateReviewParams): Promise<ReviewDto> {
    const doc = new ReviewModel({
      id: randomUUID(),
      courseId: params.courseId,
      studentId: params.studentId,
      studentName: params.studentName,
      studentAvatar: params.studentAvatar || null,
      rating: params.rating,
      comment: params.comment,
    });

    const saved = await doc.save();
    return this.toDto(saved);
  }

  async findByCourseId(courseId: string): Promise<ReviewDto[]> {
    const docs = await ReviewModel.find({ courseId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }

  async getUserReviewForCourse(studentId: string, courseId: string): Promise<ReviewDto | null> {
    const found = await ReviewModel.findOne({ studentId, courseId });
    if (!found) return null;
    return this.toDto(found);
  }

  async getAverageRatingForCourse(courseId: string): Promise<{ average: number; count: number }> {
    const docs = await ReviewModel.find({ courseId });
    if (!docs || docs.length === 0) {
      return { average: 5.0, count: 0 };
    }

    const sum = docs.reduce((acc, curr) => acc + curr.rating, 0);
    const average = Number((sum / docs.length).toFixed(1));
    return { average, count: docs.length };
  }
}
