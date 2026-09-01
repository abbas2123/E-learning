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
  const isAppError = err instanceof AppError;
  const isDuplicateKeyError = err?.code === 11000;
  const isMongooseValidationError =
    err instanceof mongoose.Error.ValidationError;
  const isMongooseCastError = err instanceof mongoose.Error.CastError;
  const isJwtError = err instanceof JsonWebTokenError;
  const isRefreshRequest = req.path.includes("/api/auth/refresh");

  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred.";

  if (isAppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
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
  } else if (err?.status) {
    statusCode = Number(err.status);
    code = statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST";
    message = err.message || message;
  }
  const requestId = req.requestId;
  const logMessage = isDev
    ? err.message || message
    : isAppError ||
        isDuplicateKeyError ||
        isMongooseValidationError ||
        isMongooseCastError ||
        isJwtError
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
