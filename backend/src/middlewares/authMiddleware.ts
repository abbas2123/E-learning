import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../modules/auth/Repository/services/JwtService";
import { UserModel } from "../modules/auth/Repository/database/User";

const jwtService = new JwtService();

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    // console.log("authheader", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing or invalid.",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("token", token);
    const decoded = jwtService.verifyAccessToken(token);
    console.log("decoded:", decoded);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    const user = await UserModel.findOne({ id: decoded.userId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Enforce OTP verification: block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requireOtp: true,
        email: user.email,
        message: "Account not verified. Please verify your email via OTP.",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired access token.",
    });
  }
}
