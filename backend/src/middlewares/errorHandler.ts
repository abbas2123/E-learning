import type { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors/AppError";
import { Logger } from "../core/logger/Logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const isDev = process.env.NODE_ENV !== "production";
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const code =
    err.code || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST");
  const requestId = req.requestId;

  Logger.error(err.message || "Unhandled server error", {
    requestId,
    statusCode,
    code,
    path: req.path,
    method: req.method,
    stack: isDev ? err.stack : undefined,
  });

  if (code === "USER_BLOCKED") {
    res.clearCookie("refreshToken", { path: "/" });
  }

  // Safe message mapping to avoid exposing MongoDB / JWT internals in production
  let message = err.message || "An unexpected error occurred.";
  if (!isDev && statusCode === 500 && !(err instanceof AppError)) {
    message =
      "Internal Server Error. Please contact support if the problem persists.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(err.details ? { details: err.details } : {}),
    ...(requestId ? { requestId } : {}),
  });
}
