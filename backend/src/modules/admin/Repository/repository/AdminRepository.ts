import type { IAdminRepository } from "../../interface/IAdminRepository";
import type { AdminStatsDto } from "../../dtos/AdminStatsDto";
import type { AdminUserDto } from "../../dtos/AdminUserDto";
import type { AdminCourseDto } from "../../dtos/AdminCourseDto";
import type { AdminCategoryDto } from "../../dtos/AdminCategoryDto";
import type { AdminEnrollmentDto } from "../../dtos/AdminEnrollmentDto";
import type { AdminNotificationDto } from "../../dtos/AdminNotificationDto";
import type { CreateCategoryDto } from "../../dtos/CreateCategoryDto";
import type { CreateUserDto } from "../../dtos/CreateUserDto";
import type { CreateCourseDto } from "../../dtos/CreateCourseDto";

import { UserModel, UserRole, UserStatus } from "../../../auth/Repository/database/User";
import { CourseModel, CourseStatus, CourseLevel } from "../../../course/repository/database/Course";
import { CategoryModel } from "../database/Category";
import { EnrollmentModel } from "../database/Enrollment";
import { randomUUID } from "crypto";
import { NotificationModel } from "../database/Notification";

export class AdminRepository implements IAdminRepository {
  async getStats(): Promise<AdminStatsDto> {
    const [totalStudents, totalInstructors, totalCourses, pendingApprovals, enrollments] =
      await Promise.all([
        UserModel.countDocuments({ role: UserRole.STUDENT }),
        UserModel.countDocuments({ role: UserRole.INSTRUCTOR }),
        CourseModel.countDocuments(),
        CourseModel.countDocuments({ status: "pending" as any }),
        EnrollmentModel.find({ status: "completed" }),
      ]);

    const totalRevenue = enrollments.reduce((sum, item) => sum + (item.amountPaid || 0), 0);

    return {
      totalRevenue,
      revenueGrowth: 0,
      totalStudents,
      studentsGrowth: 0,
      totalInstructors,
      instructorsGrowth: 0,
      totalCourses,
      coursesGrowth: 0,
      pendingApprovalsCount: pendingApprovals,
      activeEnrollmentsCount: enrollments.length,
    };
  }

  async getUsers(): Promise<AdminUserDto[]> {
    const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
    return users.map((u) => ({
      id: u.id ?? u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.isBlocked ? "blocked" : "active",
      isBlocked: u.isBlocked,
      isVerified: u.isVerified,
      avatar: u.avatar ?? undefined,
      createdAt: u.createdAt,
    }));
  }

  async toggleUserBlock(userId: string): Promise<string> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) throw new Error("User not found.");

    user.isBlocked = !user.isBlocked;
    user.status = user.isBlocked
      ? (UserStatus.BLOCKED as any)
      : (UserStatus.ACTIVE as any);
    await user.save();
    return user.isBlocked ? "blocked" : "active";
  }

  async createUser(data: CreateUserDto): Promise<AdminUserDto> {
    const newId = `usr-${Date.now()}`;
    const user = new UserModel({
      id: newId,
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role as any,
      status: UserStatus.ACTIVE,
      isVerified: true,
    });
    await user.save();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: "active",
      isBlocked: false,
      isVerified: true,
      createdAt: user.createdAt,
    };
  }

  async getCourses(): Promise<AdminCourseDto[]> {
    const docs = await CourseModel.find().sort({ createdAt: -1 });
    return docs.map((c) => {
      const doc = c as any;
      return {
        id: c.id ?? c._id.toString(),
        title: c.title,
        category: c.category ?? undefined,
        instructor: doc.instructor ?? c.createdBy ?? undefined,
        price: c.price ?? undefined,
        studentsCount: doc.studentsCount ?? 0,
        rating: doc.rating ?? 0,
        status: c.status,
        level: c.level ?? undefined,
        thumbnail: c.thumbnail ?? undefined,
        createdAt: (c as any).createdAt,
      };
    });
  }

  async getPendingCourses(): Promise<AdminCourseDto[]> {
    const docs = await CourseModel.find({ status: "pending" as any }).sort({
      createdAt: -1,
    });
    return docs.map((c) => {
      const doc = c as any;
      return {
        id: c.id ?? c._id.toString(),
        title: c.title,
        category: c.category ?? undefined,
        instructor: doc.instructor ?? c.createdBy ?? undefined,
        price: c.price ?? undefined,
        studentsCount: doc.studentsCount ?? 0,
        rating: doc.rating ?? 0,
        status: c.status,
        level: c.level ?? undefined,
      };
    });
  }

  async createCourse(data: CreateCourseDto): Promise<AdminCourseDto> {
    const newId = `crs-${Date.now()}`;
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const course = new CourseModel({
      id: newId,
      title: data.title,
      slug,
      description: data.description || data.title,
      category: data.category,
      price: Number(data.price) || 0,
      level: (data.level?.toLowerCase() as any) || CourseLevel.BEGINNER,
      thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
      status: (data.status as any) || CourseStatus.PUBLISHED,
      createdBy: "admin",
      duration: 10,
    });
    await course.save();

    return {
      id: course.id,
      title: course.title,
      category: course.category,
      price: course.price,
      status: course.status,
      level: course.level as any,
      thumbnail: course.thumbnail ?? undefined,
      createdAt: (course as any).createdAt,
    };
  }

  async approveCourse(courseId: string): Promise<AdminCourseDto> {
    const updated = await CourseModel.findOneAndUpdate(
      { id: courseId },
      { $set: { status: CourseStatus.PUBLISHED, rejectionReason: null } },
      { new: true },
    );
    if (!updated) throw new Error("Course not found.");

    // Issue system notification for approval
    try {
      await NotificationModel.create({
        id: randomUUID(),
        title: "Course Approved",
        message: `Course "${updated.title}" has been approved and published to the catalog.`,
        type: "approval",
        read: false,
      });
    } catch {
      // Ignore notification creation errors
    }

    return {
      id: updated.id ?? updated._id.toString(),
      title: updated.title,
      status: updated.status,
    };
  }

  async rejectCourse(courseId: string, _reason: string): Promise<AdminCourseDto> {
    const reasonText = _reason?.trim() || "Course content does not meet TOTC publication guidelines.";
    const updated = await CourseModel.findOneAndUpdate(
      { id: courseId },
      { $set: { status: CourseStatus.REJECTED, rejectionReason: reasonText } },
      { new: true },
    );
    if (!updated) throw new Error("Course not found.");

    try {
      await NotificationModel.create({
        id: randomUUID(),
        title: "Course Rejected",
        message: `Course "${updated.title}" was rejected. Reason: ${reasonText}`,
        type: "approval",
        read: false,
      });
    } catch {
      // Ignore notification creation errors
    }

    return {
      id: updated.id ?? updated._id.toString(),
      title: updated.title,
      status: updated.status,
    };
  }

  async deleteCourse(courseId: string): Promise<void> {
    await CourseModel.deleteOne({ id: courseId });
  }

  async getCategories(): Promise<AdminCategoryDto[]> {
    const cats = await CategoryModel.find();
    return cats.map((c) => ({
      id: c.id ?? c._id.toString(),
      name: c.name,
      slug: c.slug,
      iconName: c.iconName ?? undefined,
      color: c.color ?? undefined,
    }));
  }

  async createCategory(data: CreateCategoryDto): Promise<AdminCategoryDto> {
    const cat = new CategoryModel({
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
    });
    await cat.save();
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    };
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await CategoryModel.deleteOne({ id: categoryId });
  }

  async getEnrollments(): Promise<AdminEnrollmentDto[]> {
    const docs = await EnrollmentModel.find().sort({ createdAt: -1 });
    return docs.map((e) => ({
      id: e.id ?? e._id.toString(),
      studentName: e.studentName,
      studentEmail: e.studentEmail,
      courseTitle: e.courseTitle,
      amountPaid: e.amountPaid,
      paymentMethod: e.paymentMethod ?? "Stripe",
      status: e.status,
      enrolledAt: e.createdAt,
    }));
  }

  async getNotifications(): Promise<AdminNotificationDto[]> {
    const docs = await NotificationModel.find().sort({ createdAt: -1 });
    return docs.map((n) => ({
      id: n.id ?? n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type as AdminNotificationDto["type"],
      read: n.read,
      createdAt: n.createdAt,
    }));
  }

  async markNotificationsRead(): Promise<void> {
    await NotificationModel.updateMany({}, { read: true });
  }
}
