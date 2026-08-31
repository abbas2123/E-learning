export type CourseStatus = "draft" | "pending" | "published" | "rejected" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface InstructorCourseSummary {
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
  minCertificateScore?: number;
  studentCount: number;
  rating: number;
  reviewCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorDashboardStats {
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  draftCourses: number;
  rejectedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  recentCourses: InstructorCourseSummary[];
  recentEnrollments: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    courseId: string;
    courseTitle: string;
    amountPaid: number;
    enrolledAt: string;
  }[];
}

export interface InstructorStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatar: string | null;
  courseId: string;
  courseTitle: string;
  amountPaid: number;
  enrolledAt: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
  completionStatus: "not_started" | "in_progress" | "completed";
}

export interface InstructorPaginatedStudents {
  students: InstructorStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InstructorRevenueData {
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

export interface InstructorAnalyticsData {
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

export interface CreateCoursePayload {
  title: string;
  description: string;
  category: string;
  level?: CourseLevel;
  price?: number;
  thumbnail?: string | null;
  duration?: number;
  requirements?: string[];
  learningOutcomes?: string[];
  minCertificateScore?: number;
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {}
