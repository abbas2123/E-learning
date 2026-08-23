import { apiClient } from "./apiClient";

export interface Review {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CourseReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewPayload {
  courseId: string;
  rating: number;
  comment: string;
}

const reviewService = {
  /**
   * Fetch all reviews for a course (public)
   */
  getCourseReviews: async (courseId: string): Promise<CourseReviewsData> => {
    const res = await apiClient.get(`/api/reviews/course/${courseId}`);
    return res.data.data as CourseReviewsData;
  },

  /**
   * Submit a new review (requires auth + enrollment)
   */
  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const res = await apiClient.post("/api/reviews", payload);
    return res.data.data as Review;
  },
};

export default reviewService;
