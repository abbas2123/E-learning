export interface ReviewDto {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CreateReviewParams {
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
}

export interface IReviewRepository {
  createReview(params: CreateReviewParams): Promise<ReviewDto>;
  findByCourseId(courseId: string): Promise<ReviewDto[]>;
  getUserReviewForCourse(studentId: string, courseId: string): Promise<ReviewDto | null>;
  getAverageRatingForCourse(courseId: string): Promise<{ average: number; count: number }>;
}
