import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../modules/auth/Repository/services/JwtService";
import { UserModel } from "../modules/auth/Repository/database/User";
import type { AuthenticatedRequest } from "./authMiddleware";

const jwtService = new JwtService();

/**
 * Optional auth middleware: silently extracts userId + userRole from the Bearer
 * token when present and valid, but never blocks unauthenticated requests.
 * Use this on public routes that need to behave differently for authenticated users.
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwtService.verifyAccessToken(token);
      if (decoded?.userId) {
        const user = await UserModel.findOne({ id: decoded.userId }).select("id role isVerified");
        if (user?.isVerified) {
          req.userId = decoded.userId;
          req.userRole = user.role;
        }
      }
    } catch {
      // Silently ignore invalid or expired tokens — request proceeds as anonymous
    }
  }
  next();
}
