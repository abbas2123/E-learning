import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  const dbStatusMap: Record<number, string> = {
    0: "disconnected",
    1: "healthy",
    2: "connecting",
    3: "disconnecting",
  };

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      database: dbStatusMap[dbState] || "unknown",
      storage: "healthy",
    },
  });
});

router.get("/health/ready", (_req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  return res.status(isReady ? 200 : 503).json({
    success: isReady,
    ready: isReady,
  });
});

export default router;
