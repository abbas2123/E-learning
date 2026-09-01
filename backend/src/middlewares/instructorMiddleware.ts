import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";
import { ForbiddenError, UnauthorizedError } from "../core/errors/AppError";

export function instructorMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    return next(new UnauthorizedError());
  }

  if (req.userRole !== "instructor" && req.userRole !== "admin") {
    return next(new ForbiddenError("Instructor privileges required."));
  }

  next();
}
