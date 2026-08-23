import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
}
