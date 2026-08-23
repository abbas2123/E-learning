import apiClient from "../../../services/apiClient";

export interface AdminStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalStudents: number;
  studentsGrowth: number;
  totalInstructors: number;
  instructorsGrowth: number;
  totalCourses: number;
  coursesGrowth: number;
  pendingApprovalsCount: number;
  activeEnrollmentsCount: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  category: string;
  instructor: string;
  instructorAvatar?: string;
  price: number;
  studentsCount: number;
  rating: number;
  status: "published" | "draft" | "pending" | "archived";
  createdAt: string;
  thumbnail: string;
  modulesCount?: number;
  lessonsCount?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar?: string;
  status: "active" | "blocked" | "pending";
  isBlocked?: boolean;
  isVerified?: boolean;
  enrolledCoursesCount?: number;
  createdCoursesCount?: number;
  joinedAt?: string;
  createdAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  coursesCount?: number;
  iconName?: string;
  color?: string;
}

export interface EnrollmentRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseTitle: string;
  amountPaid: number;
  paymentMethod: string;
  enrolledAt: string;
  status: "completed" | "refunded" | "pending";
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "system" | "approval" | "user" | "payment";
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

export const adminService = {
  async getDashboardStats(): Promise<AdminStats> {
    const res = await apiClient.get<{ success: boolean; data: AdminStats }>("/api/admin/stats");
    return res.data.data;
  },

  async getCourses(): Promise<AdminCourse[]> {
    const res = await apiClient.get<{ success: boolean; data: AdminCourse[] }>("/api/admin/courses");
    return res.data.data || [];
  },

  async getPendingCourses(): Promise<AdminCourse[]> {
    const res = await apiClient.get<{ success: boolean; data: AdminCourse[] }>("/api/admin/courses/pending");
    return res.data.data || [];
  },

  async approveCourse(courseId: string): Promise<boolean> {
    await apiClient.post(`/api/admin/courses/${courseId}/approve`);
    return true;
  },

  async rejectCourse(courseId: string, reason: string): Promise<boolean> {
    await apiClient.post(`/api/admin/courses/${courseId}/reject`, { reason });
    return true;
  },

  async createCourse(data: {
    title: string;
    category: string;
    description: string;
    price: number;
    level?: string;
    thumbnail?: string;
    status?: string;
  }): Promise<AdminCourse> {
    const res = await apiClient.post<{ success: boolean; data: AdminCourse }>("/api/admin/courses", data);
    return res.data.data;
  },

  async deleteCourse(courseId: string): Promise<boolean> {
    await apiClient.delete(`/api/admin/courses/${courseId}`);
    return true;
  },

  async getUsers(): Promise<AdminUser[]> {
    const res = await apiClient.get<{ success: boolean; data: AdminUser[] }>("/api/admin/users");
    return res.data.data || [];
  },

  async toggleUserBlock(userId: string): Promise<AdminUser["status"]> {
    const res = await apiClient.patch<{ success: boolean; status: AdminUser["status"] }>(`/api/admin/users/${userId}/block`);
    return res.data.status;
  },

  async createUser(data: { name: string; email: string; role: "student" | "instructor" | "admin" }): Promise<AdminUser> {
    const res = await apiClient.post<{ success: boolean; data: AdminUser }>("/api/admin/users", data);
    return res.data.data;
  },

  async getCategories(): Promise<CategoryItem[]> {
    const res = await apiClient.get<{ success: boolean; data: CategoryItem[] }>("/api/admin/categories");
    return res.data.data || [];
  },

  async createCategory(data: { name: string; slug?: string }): Promise<CategoryItem> {
    const res = await apiClient.post<{ success: boolean; data: CategoryItem }>("/api/admin/categories", data);
    return res.data.data;
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    await apiClient.delete(`/api/admin/categories/${categoryId}`);
    return true;
  },

  async getEnrollments(): Promise<EnrollmentRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: EnrollmentRecord[] }>("/api/admin/enrollments");
    return res.data.data || [];
  },

  async getNotifications(): Promise<SystemNotification[]> {
    const res = await apiClient.get<{ success: boolean; data: SystemNotification[] }>("/api/admin/notifications");
    return res.data.data || [];
  },

  async markNotificationsRead(): Promise<boolean> {
    await apiClient.patch("/api/admin/notifications/read");
    return true;
  },
};
