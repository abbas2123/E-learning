import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "instructor", "admin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(4).max(6),
});

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive"),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  thumbnail: z.string().url().optional().nullable(),
});

export const createDiscussionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  question: z.string().min(5, "Question must be at least 5 characters"),
  lessonId: z.string().optional().nullable(),
});

export const createReplySchema = z.object({
  content: z.string().min(1, "Reply content cannot be empty"),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});
