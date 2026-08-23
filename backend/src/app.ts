import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "dotenv/config";

import { requestIdMiddleware } from "./middlewares/requestIdMiddleware.js";
import { apiLimiter, authLimiter, paymentLimiter } from "./middlewares/rateLimiter.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/routes/dashboard.routes.js";
import ProfileRoute from "./modules/profile/routes/profileRoutes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import courseRoutes from "./modules/course/routes/course.routes.js";
import paymentRoutes from "./modules/payment/routes/payment.routes.js";
import reviewRoutes from "./modules/review/routes/review.routes.js";
import wishlistRoutes from "./modules/wishlist/routes/wishlist.routes.js";
import curriculumRoutes from "./modules/curriculum/routes/curriculumRoutes.js";
import progressRoutes from "./modules/progress/routes/progressRoutes.js";
import certificateRoutes from "./modules/certificate/routes/certificateRoutes.js";
import quizRoutes from "./modules/quiz/routes/quizRoutes.js";
import instructorRoutes from "./modules/instructor/routes/instructorRoutes.js";
import discussionRoutes from "./modules/discussion/routes/discussionRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for flexibility in API deployment; enabled per gateway
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

// Request Tracing
app.use(requestIdMiddleware);

// Body parsers with size limit protection
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// General API rate limiter
app.use("/api", apiLimiter);

// Health Check Routes
app.use("/api", healthRoutes);

// Module Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", ProfileRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/course", courseRoutes);
app.use("/courses", courseRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", curriculumRoutes);
app.use("/api", progressRoutes);
app.use("/api", certificateRoutes);
app.use("/api", quizRoutes);
app.use("/api", discussionRoutes);

// Global error handler — must be last
app.use(errorHandler);

export default app;
