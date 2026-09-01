import type { Request, Response, NextFunction } from "express";
import type { AuthenticateUserUseCase } from "../modules/auth/useCase/AuthenticateUserUseCase";
import { UnauthorizedError } from "../core/errors/AppError";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function createAuthMiddleware(
  authenticateUser: AuthenticateUserUseCase,
) {
  return async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new UnauthorizedError("Authentication token missing or invalid."),
      );
    }

    try {
      const authenticatedUser = await authenticateUser.execute(
        authHeader.split(" ")[1],
      );
      req.userId = authenticatedUser.userId;
      req.userRole = authenticatedUser.userRole;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
