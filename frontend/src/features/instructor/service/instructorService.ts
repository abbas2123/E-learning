import apiClient from "../../../services/apiClient";
import type {
  InstructorDashboardStats,
  InstructorCourseSummary,
  InstructorPaginatedStudents,
  InstructorRevenueData,
  InstructorAnalyticsData,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "../types/instructor.types";

export const getDashboardStats = async (): Promise<InstructorDashboardStats> => {
  const response = await apiClient.get("/api/instructor/dashboard");
  return response.data.data;
};

export const getCourses = async (status?: string): Promise<InstructorCourseSummary[]> => {
  const response = await apiClient.get("/api/instructor/courses", {
    params: { status },
  });
  return response.data.data;
};

export const getCourseById = async (courseId: string): Promise<InstructorCourseSummary> => {
  const response = await apiClient.get(`/api/instructor/courses/${courseId}`);
  return response.data.data;
};

export const createCourse = async (payload: CreateCoursePayload): Promise<InstructorCourseSummary> => {
  const response = await apiClient.post("/api/instructor/courses", payload);
  return response.data.data;
};

export const updateCourse = async (
  courseId: string,
  payload: UpdateCoursePayload,
): Promise<InstructorCourseSummary> => {
  const response = await apiClient.put(`/api/instructor/courses/${courseId}`, payload);
  return response.data.data;
};

export const submitCourseForApproval = async (
  courseId: string,
): Promise<{ success: boolean; message: string; course: InstructorCourseSummary }> => {
  const response = await apiClient.post(`/api/instructor/courses/${courseId}/submit`);
  return response.data;
};

export const getStudents = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<InstructorPaginatedStudents> => {
  const response = await apiClient.get("/api/instructor/students", {
    params: { page, limit, search },
  });
  return response.data.data;
};

export const getRevenue = async (): Promise<InstructorRevenueData> => {
  const response = await apiClient.get("/api/instructor/revenue");
  return response.data.data;
};

export const getAnalytics = async (): Promise<InstructorAnalyticsData> => {
  const response = await apiClient.get("/api/instructor/analytics");
  return response.data.data;
};

const instructorService = {
  getDashboardStats,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  submitCourseForApproval,
  getStudents,
  getRevenue,
  getAnalytics,
};

export default instructorService;
