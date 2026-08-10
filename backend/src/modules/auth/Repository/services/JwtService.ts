import jwt, { type SignOptions } from "jsonwebtoken";
import type { IJwtService } from "../../interface/IJwtService";
const expiresIn = (process.env.ACCESS_TOKEN_EXPIRES_IN ??
  "15m") as SignOptions["expiresIn"];
export class JwtService implements IJwtService {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn,
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn,
    });
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      userId: string;
    };
  }
}
