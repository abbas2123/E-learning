import apiClient from "./apiClient";
import type { ActiveStudentCourse } from "../features/Home/components/UserDashboardWidgets";
import type { CourseItem } from "../features/Home/sections/CoursesSection";

export type ResumeCourseData = {
  courseId: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  progressPercentage: number;
  thumbnail?: string;
};

export type DashboardSummaryResponse = {
  enrolledCount: number;
  activeCount: number;
  completedCount: number;
  certificatesCount: number;
  resumeCourse?: ResumeCourseData | null;
  nextClass?: {
    title: string;
    instructor: string;
    room: string;
    startTime: string;
    avatar?: string;
  } | null;
};

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    const res = await apiClient.get<{ success: boolean; data: DashboardSummaryResponse }>("/api/dashboard/summary");
    return res.data.data;
  },

  async getActiveCourses(): Promise<ActiveStudentCourse[]> {
    const res = await apiClient.get<{ success: boolean; data: ActiveStudentCourse[] }>("/api/dashboard/active-courses");
    return res.data.data;
  },

  async getCoursesCatalog(): Promise<CourseItem[]> {
    const res = await apiClient.get<{ success: boolean; data: CourseItem[] }>("/api/dashboard/courses");
    return res.data.data;
  },
};
