import mongoose from "mongoose";
import app from "./app.js";
import { Logger } from "./core/logger/Logger.js";

const PORT = process.env.PORT ?? 3000;
const MONGO_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "";

function validateProductionEnv() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) return;

  const requiredVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "CLIENT_URL",
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `FATAL: Missing required production environment variables: ${missing.join(", ")}. Cannot start in production without explicit configuration.`,
    );
  }
}

async function bootstrap() {
  try {
    validateProductionEnv();

    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }

    await mongoose.connect(MONGO_URI);
    Logger.info("✅ MongoDB connected successfully");

    const server = app.listen(PORT, () => {
      Logger.info(`🚀 TOTC API Server running on http://localhost:${PORT}`);
    });

    const shutdown = async (signal: string) => {
      Logger.info(`Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        Logger.info("HTTP server closed.");
        try {
          await mongoose.connection.close();
          Logger.info("MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          Logger.error("Error closing MongoDB connection", { error: err });
          process.exit(1);
        }
      });

      // Force exit after 10s timeout
      setTimeout(() => {
        Logger.error("Forcefully shutting down server due to timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err: any) {
    Logger.error("❌ Failed to start TOTC server", { error: err?.message || err });
    process.exit(1);
  }
}

bootstrap();
