import type { AdminStatsDto } from "../dtos/AdminStatsDto";
import type { AdminUserDto } from "../dtos/AdminUserDto";
import type { AdminCourseDto } from "../dtos/AdminCourseDto";
import type { AdminCategoryDto } from "../dtos/AdminCategoryDto";
import type { AdminEnrollmentDto } from "../dtos/AdminEnrollmentDto";
import type { AdminNotificationDto } from "../dtos/AdminNotificationDto";
import type { CreateCategoryDto } from "../dtos/CreateCategoryDto";
import type { CreateUserDto } from "../dtos/CreateUserDto";
import type { CreateCourseDto } from "../dtos/CreateCourseDto";

export interface IAdminRepository {
  // Stats
  getStats(): Promise<AdminStatsDto>;

  // Users
  getUsers(): Promise<AdminUserDto[]>;
  toggleUserBlock(userId: string): Promise<string>;
  createUser(data: CreateUserDto): Promise<AdminUserDto>;

  // Courses
  getCourses(): Promise<AdminCourseDto[]>;
  getPendingCourses(): Promise<AdminCourseDto[]>;
  createCourse(data: CreateCourseDto): Promise<AdminCourseDto>;
  approveCourse(courseId: string): Promise<AdminCourseDto>;
  rejectCourse(courseId: string, reason: string): Promise<AdminCourseDto>;
  deleteCourse(courseId: string): Promise<void>;

  // Categories
  getCategories(): Promise<AdminCategoryDto[]>;
  createCategory(data: CreateCategoryDto): Promise<AdminCategoryDto>;
  deleteCategory(categoryId: string): Promise<void>;

  // Enrollments
  getEnrollments(): Promise<AdminEnrollmentDto[]>;

  // Notifications
  getNotifications(): Promise<AdminNotificationDto[]>;
  markNotificationsRead(): Promise<void>;
}
