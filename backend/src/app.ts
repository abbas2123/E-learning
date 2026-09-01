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
import notificationRoutes from "./modules/notification/routes/notification.routes.js";
import categoryRoutes from "./modules/category/routes/category.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for flexibility in API deployment; enabled per gateway
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS configuration supporting single/multi origins and local dev ports
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"];

const isDev = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In production: strict match against allowedOrigins. In development: allow localhost regex
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-request-id"],
    exposedHeaders: ["x-request-id"],
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);

// Global error handler — must be last
app.use(errorHandler);

export default app;
