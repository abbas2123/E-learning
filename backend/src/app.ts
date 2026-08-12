import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/routes/dashboard.routes.js";
import ProfileRoute from "./modules/profile/routes/profileRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/health", (_req, res) => {
  res.send("server is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", ProfileRoute);

// Global error handler — must be last
app.use(errorHandler);

export default app;
