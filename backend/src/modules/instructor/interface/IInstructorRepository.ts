import type { CourseStatus, CourseLevel } from "../../course/repository/database/Course";

export interface InstructorCourseSummaryDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: CourseLevel;
  price: number;
  discountPrice: number | null;
  duration: number;
  status: CourseStatus;
  rejectionReason: string | null;
  createdBy: string;
  requirements: string[];
  learningOutcomes: string[];
  studentCount: number;
  rating: number;
  reviewCount: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstructorDashboardStatsDto {
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  draftCourses: number;
  rejectedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  recentCourses: InstructorCourseSummaryDto[];
  recentEnrollments: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    courseId: string;
    courseTitle: string;
    amountPaid: number;
    enrolledAt: Date;
  }[];
}

export interface InstructorStudentDto {
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatar: string | null;
  courseId: string;
  courseTitle: string;
  amountPaid: number;
  enrolledAt: Date;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
  completionStatus: "not_started" | "in_progress" | "completed";
}

export interface InstructorPaginatedStudentsDto {
  students: InstructorStudentDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InstructorRevenueDto {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  monthlyBreakdown: { month: string; amount: number }[];
  courseBreakdown: {
    courseId: string;
    title: string;
    enrollmentsCount: number;
    revenue: number;
  }[];
}

export interface InstructorAnalyticsDto {
  totalEnrollments: number;
  averageCompletionRate: number;
  averageRating: number;
  totalReviews: number;
  coursePerformance: {
    courseId: string;
    title: string;
    students: number;
    completionRate: number;
    rating: number;
    revenue: number;
  }[];
}

export interface CreateInstructorCourseParams {
  title: string;
  description: string;
  category: string;
  level?: CourseLevel;
  price?: number;
  thumbnail?: string | null;
  duration?: number;
  requirements?: string[];
  learningOutcomes?: string[];
}

export interface UpdateInstructorCourseParams {
  title?: string;
  description?: string;
  category?: string;
  level?: CourseLevel;
  price?: number;
  thumbnail?: string | null;
  duration?: number;
  requirements?: string[];
  learningOutcomes?: string[];
}

export interface IInstructorRepository {
  getDashboardStats(instructorId: string): Promise<InstructorDashboardStatsDto>;
  getCourses(instructorId: string, status?: string): Promise<InstructorCourseSummaryDto[]>;
  getCourseById(courseId: string, instructorId?: string): Promise<InstructorCourseSummaryDto | null>;
  createCourse(instructorId: string, params: CreateInstructorCourseParams): Promise<InstructorCourseSummaryDto>;
  updateCourse(courseId: string, instructorId: string, params: UpdateInstructorCourseParams): Promise<InstructorCourseSummaryDto | null>;
  submitCourseForApproval(courseId: string, instructorId: string): Promise<{ success: boolean; message: string; course: InstructorCourseSummaryDto }>;
  getStudents(instructorId: string, page: number, limit: number, search?: string): Promise<InstructorPaginatedStudentsDto>;
  getRevenue(instructorId: string): Promise<InstructorRevenueDto>;
  getAnalytics(instructorId: string): Promise<InstructorAnalyticsDto>;
}
