import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";
import { ForbiddenError, UnauthorizedError } from "../core/errors/AppError";

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    return next(new UnauthorizedError());
  }

  if (req.userRole !== "admin") {
    return next(new ForbiddenError("Admin privileges required."));
  }

  next();
}
