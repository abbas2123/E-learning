import type { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors/AppError";
import { Logger } from "../core/logger/Logger";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import mongoose from "mongoose";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const isDev = process.env.NODE_ENV !== "production";
  const isDuplicateKeyError = err?.code === 11000;
  const isMongooseValidationError =
    err instanceof mongoose.Error.ValidationError;
  const isMongooseCastError = err instanceof mongoose.Error.CastError;
  const isJwtError = err instanceof JsonWebTokenError;
  const isRefreshRequest = req.path.includes("/api/auth/refresh");

  const rawStatus =
    typeof err?.statusCode === "number"
      ? err.statusCode
      : typeof err?.status === "number"
        ? err.status
        : !isNaN(Number(err?.status)) && err?.status !== undefined
          ? Number(err.status)
          : undefined;

  const isAppError =
    err instanceof AppError ||
    err?.isAppError === true ||
    err?.name === "AppError" ||
    (typeof rawStatus === "number" && rawStatus >= 400 && rawStatus < 500);

  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred.";

  if (isAppError) {
    statusCode = err.statusCode || rawStatus || 400;
    code =
      err.code ||
      (statusCode === 404
        ? "NOT_FOUND"
        : statusCode === 401
          ? "UNAUTHORIZED"
          : statusCode === 403
            ? "FORBIDDEN"
            : statusCode === 409
              ? "CONFLICT"
              : statusCode === 422
                ? "UNPROCESSABLE_ENTITY"
                : "BAD_REQUEST");
    message = err.message || message;
  } else if (isDuplicateKeyError) {
    statusCode = 409;
    code = "RESOURCE_CONFLICT";
    message = "A resource with the provided value already exists.";
  } else if (isMongooseValidationError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "The request contains invalid data.";
  } else if (isMongooseCastError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "The request contains an invalid resource identifier.";
  } else if (isJwtError) {
    statusCode = 401;
    code = isRefreshRequest
      ? "INVALID_REFRESH_TOKEN"
      : err instanceof TokenExpiredError
        ? "ACCESS_TOKEN_EXPIRED"
        : "INVALID_ACCESS_TOKEN";
    message = isRefreshRequest
      ? "Invalid or expired refresh token."
      : err instanceof TokenExpiredError
        ? "Access token expired."
        : "Invalid access token.";
  } else if (rawStatus) {
    statusCode = rawStatus;
    code =
      err.code || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST");
    message = err.message || message;
  } else if (err instanceof Error) {
    const msg = err.message || "";
    if (
      msg.startsWith("Certificate Ineligible:") ||
      msg.includes("Course completion requirements have not been met") ||
      msg.includes("remaining to complete") ||
      (msg.includes("lesson") && msg.includes("incomplete"))
    ) {
      statusCode = 400;
      code = "CERTIFICATE_INELIGIBLE";
      message = msg;
    } else if (msg.toLowerCase().includes("not found")) {
      statusCode = 404;
      code = "NOT_FOUND";
      message = msg;
    } else if (
      msg.includes("required") ||
      msg.includes("must be") ||
      msg.includes("cannot be empty") ||
      msg.includes("Invalid") ||
      msg.includes("does not belong to")
    ) {
      statusCode = 400;
      code = "VALIDATION_ERROR";
      message = msg;
    } else if (
      msg.includes("Authentication required") ||
      msg.includes("Authenticated user required")
    ) {
      statusCode = 401;
      code = "UNAUTHORIZED";
      message = msg;
    } else if (
      msg.includes("Unauthorized") ||
      msg.includes("Access denied") ||
      msg.includes("not allowed") ||
      msg.includes("privileges required")
    ) {
      statusCode = 403;
      code = "FORBIDDEN";
      message = msg;
    } else if (
      msg.includes("already exists") ||
      msg.includes("already enrolled") ||
      msg.includes("already reviewed") ||
      msg.includes("already reported") ||
      msg.includes("already revoked") ||
      msg.includes("Duplicate")
    ) {
      statusCode = 409;
      code = "CONFLICT";
      message = msg;
    }
  }

  const isKnownError =
    isAppError ||
    isDuplicateKeyError ||
    isMongooseValidationError ||
    isMongooseCastError ||
    isJwtError ||
    (statusCode >= 400 && statusCode < 500);

  const requestId = req.requestId;
  const logMessage = isDev
    ? err.message || message
    : isKnownError
      ? message
      : "Unhandled server error";

  Logger.error(logMessage, {
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

  if (!isDev && statusCode === 500 && !isAppError) {
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

